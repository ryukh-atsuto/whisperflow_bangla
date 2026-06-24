'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioRecorder } from '../lib/useAudioRecorder';
import { banglaToBanglish } from '../lib/banglaToBanglish';
import { cleanPhoneticInput } from '../lib/phoneticCleaner';
import { AudioVisualizer } from './AudioVisualizer';
import { 
  Mic, 
  Square, 
  Copy, 
  Check, 
  Trash2, 
  HelpCircle, 
  Languages, 
  RefreshCw, 
  Sparkles,
  Info
} from 'lucide-react';

export const VoiceRecorder: React.FC = () => {
  const {
    isRecording,
    recordingTime,
    audioLevels,
    startRecording,
    stopRecording,
    permissionError,
    clearRecorderState
  } = useAudioRecorder();

  // Tab State variables conforming to new specifications
  const [banglaCleaned, setBanglaCleaned] = useState('');
  const [banglishText, setBanglishText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [language, setLanguage] = useState<'bn' | 'en' | null>(null);
  
  const [activeTab, setActiveTab] = useState<'bangla' | 'banglish' | 'english'>('banglish');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const recordingActiveRef = useRef(false);

  // Sync ref to avoid closure issues in key listeners
  useEffect(() => {
    recordingActiveRef.current = isRecording;
  }, [isRecording]);

  // Current active text selector helper
  const getActiveText = useCallback(() => {
    if (activeTab === 'bangla') return banglaCleaned;
    if (activeTab === 'banglish') return banglishText;
    return englishText;
  }, [activeTab, banglaCleaned, banglishText, englishText]);

  // Clipboard functionality
  const triggerCopy = useCallback(() => {
    const textToCopy = getActiveText();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getActiveText]);

  const clearAll = useCallback(() => {
    setBanglaCleaned('');
    setBanglishText('');
    setEnglishText('');
    setLanguage(null);
    setError(null);
    clearRecorderState();
  }, [clearRecorderState]);

  const handleStartRecording = useCallback(async () => {
    setError(null);
    clearRecorderState();
    try {
      await startRecording();
    } catch (err: any) {
      setError(err.message || 'Could not access microphone');
    }
  }, [startRecording, clearRecorderState]);

  const handleStopRecording = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const audioBlob = await stopRecording();
      if (!audioBlob) {
        setIsProcessing(false);
        return;
      }

      // Prepare form data to send to next.js proxy API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Transcription failed with status ${response.status}`);
      }

      const data = await response.json(); 
      // Expected backend format: { raw_text: "...", language: "bn" | "en", confidence: 0.0-1.0, translation?: "..." }
      
      const cleanedText = data.text || '';
      const detectedLang = data.language || 'en';
      const translation = data.translation || '';

      setLanguage(detectedLang);

      if (detectedLang === 'bn') {
        setBanglaCleaned(cleanedText);
        const rawBanglish = banglaToBanglish(cleanedText);
        const transliterated = cleanPhoneticInput(rawBanglish);
        setBanglishText(transliterated);
        setEnglishText(translation);
        setActiveTab('banglish'); // Default tab for Bangla speech
      } else {
        setBanglaCleaned('');
        setBanglishText('');
        setEnglishText(cleanedText);
        setActiveTab('english'); // Default tab for English speech
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [stopRecording]);

  // Click handler for toggle (handles standard click recording)
  const handleMicClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  // Keyboard holds space functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkey conflicts when typing in textareas or inputs
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        // Ctrl+Enter to copy from textarea
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          triggerCopy();
        }
        return;
      }

      if (e.key === ' ' && !recordingActiveRef.current && !isProcessing) {
        e.preventDefault();
        setIsKeyboardMode(true);
        handleStartRecording();
      }

      // Escape to clear text
      if (e.key === 'Escape') {
        e.preventDefault();
        clearAll();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && recordingActiveRef.current) {
        e.preventDefault();
        setIsKeyboardMode(false);
        handleStopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isProcessing, handleStartRecording, handleStopRecording, triggerCopy, clearAll]);

  // Utility to handle manual editing
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (activeTab === 'bangla') {
      setBanglaCleaned(val);
      // Auto-update Banglish transliteration when Bangla script is modified!
      setBanglishText(banglaToBanglish(val));
    } else if (activeTab === 'banglish') {
      setBanglishText(val);
    } else {
      setEnglishText(val);
    }
  };

  // Format recording time to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeText = getActiveText();

  return (
    <div className="w-full max-w-2xl px-4 py-8 mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            WhisperFlow Bangla <Sparkles className="w-4 h-4 text-violet-400" />
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Instructions Panel */}
      {showHelp && (
        <div className="mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-sm text-zinc-600 dark:text-zinc-400 animate-fadeIn">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-violet-500" /> Keyboard Shortcuts
          </h3>
          <ul className="space-y-1 list-disc pl-5">
            <li>Hold <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono">SPACEBAR</kbd> anywhere on screen to record; release to transcribe.</li>
            <li>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono">Enter</kbd> while editing to copy output.</li>
            <li>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono">ESC</kbd> to clear output fields.</li>
          </ul>
        </div>
      )}

      {/* Main Glassmorphic Panel */}
      <div className="relative p-6 md:p-8 rounded-2xl border border-white/10 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/80 backdrop-blur-xl shadow-2xl transition-all duration-300">
        
        {/* Dynamic Visualizer / Time indicator */}
        <div className="flex flex-col items-center justify-center min-h-[90px] mb-6">
          {isRecording ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-sm font-mono text-pink-500 font-medium tracking-widest animate-pulse">
                REC • {formatTime(recordingTime)}
              </span>
              <AudioVisualizer levels={audioLevels} isRecording={isRecording} />
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse font-medium">
                Transcribing voice input...
              </span>
            </div>
          ) : (
            <div className="text-center text-zinc-400 dark:text-zinc-500 text-sm max-w-sm">
              {isKeyboardMode ? (
                <span className="text-violet-500 dark:text-violet-400 font-medium">Listening to Spacebar hold...</span>
              ) : (
                "Speak in English or Bangla. Tap mic to record or hold Spacebar."
              )}
            </div>
          )}
        </div>

        {/* Center Mic Button */}
        <div className="flex justify-center mb-8 relative">
          <button
            ref={micButtonRef}
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110'
                : isProcessing
                ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed scale-95'
                : 'bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(109,40,217,0.3)] hover:scale-105 active:scale-95'
            }`}
            title={isRecording ? "Click to stop recording" : "Click to start recording"}
          >
            {isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
            
            {/* Pulsing ring animation for recording state */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-rose-500 animate-ping opacity-75" />
                <div className="absolute -inset-4 rounded-full border-2 border-rose-400/35 animate-pulse" />
              </>
            )}
          </button>
        </div>

        {/* Error Notification */}
        {(error || permissionError) && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-500 flex flex-col gap-1">
            <span className="font-semibold">Error:</span>
            <span>{error || permissionError}</span>
            {permissionError && (
              <span className="text-xs text-red-400">Please grant microphone access in browser settings.</span>
            )}
          </div>
        )}

        {/* Dual/Triple Output Tabs Panel */}
        {language && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-4 overflow-x-auto">
            {language === 'bn' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('banglish')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'banglish'
                      ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Banglish
                </button>
              </>
            )}
            {(language === 'en' || language === 'bn') && (
              <button
                type="button"
                onClick={() => setActiveTab('english')}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'english'
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                English {language === 'bn' && '(Translation)'}
              </button>
            )}
          </div>
        )}

        {/* Output Text Field (MVC View + Controller connection) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {activeTab === 'bangla' ? 'Bangla Output' : activeTab === 'banglish' ? 'Banglish Output' : 'English Output'}
            </label>
            
            {/* Language and status pills */}
            {language && (
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                  <Languages className="w-3 h-3" />
                  {language === 'bn' ? '🇧🇩 Bangla Spoken' : '🇺🇸 English Spoken'}
                </span>
              </div>
            )}
          </div>

          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={activeText}
              onChange={handleTextChange}
              placeholder="Your transcribed text will appear here. You can also edit it directly..."
              className="w-full min-h-[160px] p-4 text-base rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-y shadow-inner"
            />
            {activeText && (
              <button
                onClick={clearAll}
                className="absolute right-3 bottom-3 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-red-500/10 hover:text-red-500 text-zinc-400 dark:text-zinc-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Clear Text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Row below output textbox */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-between items-stretch sm:items-center">
            
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              {!language && "Awaiting voice input..."}
              {language === 'bn' && `Active tab: ${activeTab === 'bangla' ? 'Bangla script' : activeTab === 'banglish' ? 'Romanized Banglish' : 'English Translation'}`}
              {language === 'en' && "Active tab: English transcription"}
            </div>

            {/* Copy Button */}
            <button
              onClick={triggerCopy}
              disabled={!activeText}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : activeText
                  ? 'bg-violet-600 hover:bg-violet-700 text-white hover:shadow-[0_0_15px_rgba(109,40,217,0.35)]'
                  : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent dark:border-zinc-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy {activeTab === 'bangla' ? 'Bangla' : activeTab === 'banglish' ? 'Banglish' : 'English'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
