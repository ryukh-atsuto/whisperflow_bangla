# WhisperFlow Bangla - Automatic Voice Typing Web Application

WhisperFlow Bangla is a free, open-source voice typing web application designed to translate spoken voice inputs into text, automatically detecting the spoken language.

## Key Features & Conversion Rules

* **Auto-Language Detection:** The system automatically determines if the user is speaking Bangla or English.
* **Bangla to Banglish Output:** If you speak in Bangla (e.g., *"আমি ভাত খাই"*), the system output will automatically transcribe and transliterate it into **Banglish** (romanized Bangla: `ami bhaat khai`).
* **Banglish/Bangla Toggle:** For Bangla spoken inputs, the UI provides a dual-state view toggle, allowing the user to view/edit/copy either the **Banglish** phonetic translation or the **Original Bangla** script.
* **English Output:** If you speak in English (e.g., *"I am going to school"*), the system outputs standard English text.
* **Responsive Visualizer:** A glowing, real-time visualizer that responds dynamically to audio levels as you record.
* **Keyboard Hotkeys:**
  * Hold `Spacebar` anywhere on the page to start recording; release it to stop and transcribe (Walkie-Talkie style).
  * Press `Ctrl + Enter` in the output box to copy the transcribed text to your clipboard.
  * Press `Escape` to reset the recorder state and clear all inputs.

---

## Technical Stack & Architecture (MVC)

The system adheres to a clean Model-View-Controller (MVC) structure:

```
[Browser Audio Input] ---> [useAudioRecorder (Model)] ---> [VoiceRecorder (View)]
                                                                    |
                                                                    v
[Python Backend (Model)] <--- [FastAPI /transcribe (Controller)] <--- [Next.js Route Proxy (Controller)]
```

* **Model Layer:**
  * **Audio Recorder:** `lib/useAudioRecorder.ts` manages Web Audio API streams, amplitude analyzing, and recording chunks.
  * **Transliteration Engine:** `lib/banglaToBanglish.ts` employs a hybrid dictionary mapping + phonetic rule engine to convert Unicode Bangla characters into accurate, readable Banglish.
  * **Neural Inference Engine:** `backend/whisper_server.py` hosts a local, offline-capable `faster-whisper` "base" model using `ctranslate2` running on CPU (`int8` quantized).
* **Controller Layer:**
  * **FastAPI Server:** Exposes a `/transcribe` multipart form-data endpoint handling wav/webm uploads and feeding them into the Whisper pipeline.
  * **Next.js Proxy Router:** `app/api/transcribe/route.ts` proxies browser multipart audio uploads directly to the backend FastAPI server, guarding backend configurations.
* **View Layer:**
  * **Next.js Frontend:** Built in Next.js 14 (App Router) using Tailwind CSS.
  * **VoiceRecorder Component:** `components/VoiceRecorder.tsx` controls recording state, renders the visualizer, handles user adjustments, copy features, and keyboard hotkeys.
  * **AudioVisualizer Component:** `components/AudioVisualizer.tsx` paints the real-time audio waveform.

---

## Setup & Running the Project

### Prerequisites
* **Python 3.8 to 3.14**
* **Node.js 18+**

### The Easy Way: Using the Control Center (Windows)
We provide a unified Windows batch script to automate everything.
Simply double-click or run `whisperflow.bat` in your terminal:
```bash
whisperflow.bat
```
From the interactive menu:
1. Choose `[1]` to run the full installer. This installs all Node modules and configures a Python virtual environment (`venv`) with all requirements automatically.
2. Choose `[2]` to start both the Python backend and Next.js frontend in parallel.
3. The app will be live at: [http://localhost:3000](http://localhost:3000)

### Manual Setup (Step-by-Step)

#### 1. Setup Python Backend
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the transcription server:
   ```bash
   python whisper_server.py
   ```
   *The server runs at `http://localhost:8000`. On first start, it will automatically download the Whisper `base` model to your local machine.*

#### 2. Setup Next.js Frontend
1. In the root directory, install Node modules:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## File Structure

```
├── app/
│   ├── api/transcribe/route.ts  # Next.js proxy route (Controller)
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # App root layout
│   └── page.tsx                 # App landing page (View)
├── backend/
│   ├── whisper_server.py        # FastAPI server running faster-whisper (Controller/Model)
│   └── requirements.txt         # Python package list
├── components/
│   ├── AudioVisualizer.tsx      # Waveform audio equalizer component (View)
│   └── VoiceRecorder.tsx        # Voice typing interface controller (View/Controller)
├── lib/
│   ├── banglaToBanglish.ts      # Bangla-to-Banglish transliteration engine (Model)
│   └── useAudioRecorder.ts      # Browser audio stream capture hook (Model)
├── whisperflow.bat              # Setup and control script for Windows users
└── README.md                    # This document
```

---

## License

This project is open-source and free to use under the MIT License.
