import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  audioLevels: number[];
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  permissionError: string | null;
  clearRecorderState: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(0.05));
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up references and stop media stream tracks
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error('Error closing AudioContext:', e);
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const clearRecorderState = useCallback(() => {
    setRecordingTime(0);
    setAudioLevels(Array(30).fill(0.05));
  }, []);

  const startRecording = useCallback(async () => {
    cleanup();
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      // 1. Request microphone permission with web audio enhancements (mono, echo cancellation, noise suppression, auto gain control)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // 2. Initialize MediaRecorder
      // Note: we let the browser select the default supported mimeType
      const options = { mimeType: 'audio/webm' };
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback for Safari/iOS which might not support audio/webm
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 3. Initialize Web Audio API for visualizer levels
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64; // Small size for fast response
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Loop to fetch audio amplitudes for visualizer pulse effect
      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average amplitude (normalized 0 to 1)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.max(0.02, Math.min(1.0, average / 140)); // Scale for UI visual response

        setAudioLevels((prev) => {
          const next = [...prev.slice(1), normalized];
          return next;
        });

        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      // 4. Start recording and animation
      mediaRecorder.start(100); // chunk every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      updateVisualizer();

    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      setPermissionError(err.message || 'Microphone access denied');
      setIsRecording(false);
      cleanup();
      throw err;
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        setIsRecording(false);
        cleanup();
        resolve(audioBlob);
      };

      // Trigger the MediaRecorder stop
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping media recorder:', e);
        setIsRecording(false);
        cleanup();
        resolve(null);
      }
    });
  }, [cleanup]);

  return {
    isRecording,
    recordingTime,
    audioLevels,
    startRecording,
    stopRecording,
    permissionError,
    clearRecorderState
  };
}
