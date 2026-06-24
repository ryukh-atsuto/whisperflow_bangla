import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhisperFlow Bangla - Open Source Voice Typing',
  description: 'A free, open-source voice typing web application. Speaks English to output English, speaks Bangla to output Banglish (romanized Bangla). Powered by faster-whisper.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Defaulting to "dark bg-zinc-950" to provide a premium, modern aesthetic right from the start
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
