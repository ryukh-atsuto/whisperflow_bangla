import React from 'react';

interface AudioVisualizerProps {
  levels: number[];
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ levels, isRecording }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-16 w-full max-w-md px-4 py-2">
      {levels.map((level, idx) => {
        // Compute height based on audio level
        const baseHeight = isRecording ? 4 + level * 52 : 4; // Min 4px, Max 56px height
        const opacity = isRecording ? 0.3 + level * 0.7 : 0.2;

        return (
          <div
            key={idx}
            className={`w-[6px] rounded-full transition-all duration-75 bg-gradient-to-t from-violet-600 via-fuchsia-500 to-pink-500`}
            style={{
              height: `${baseHeight}px`,
              opacity: opacity,
            }}
          />
        );
      })}
    </div>
  );
};
