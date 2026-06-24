import { VoiceRecorder } from '../components/VoiceRecorder';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 flex flex-col justify-between py-12 px-4 relative overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/10 dark:bg-pink-600/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        
        {/* Logo / Title */}
        <div className="text-center mb-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs text-violet-600 dark:text-violet-400 font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free & Open Source
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 mb-3">
            WhisperFlow Bangla
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base">
            Type with your voice. Speaks English to output English, and Bangla to output Banglish (romanized Bangla) automatically.
          </p>
        </div>

        {/* Voice Typing Workspace */}
        <VoiceRecorder />

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-500 dark:text-zinc-600 py-6 z-10 flex flex-col items-center gap-3">
        <p>© 2026 WhisperFlow Bangla. Built with Next.js 14 & faster-whisper.</p>
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg> GitHub Project
          </a>
        </div>
      </footer>
    </main>
  );
}
