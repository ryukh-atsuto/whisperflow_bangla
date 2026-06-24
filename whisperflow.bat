@echo off
setlocal enabledelayedexpansion
title WhisperFlow Bangla - Control Center

:MENU
cls
echo =====================================================================
echo                     WHISPERFLOW BANGLA CONTROL PANEL
echo =====================================================================
echo.
echo   [1] Full Installation ^& Setup (Node.js + Python Venv)
echo   [2] Start Application (Launch Backend + Frontend in parallel)
echo   [3] Start Python Transcription Backend Only
echo   [4] Start Next.js Frontend Only
echo   [5] Build Next.js Production Bundle
echo   [6] Exit
echo.
echo =====================================================================
set /p choice="Enter your choice [1-6]: "

if "%choice%"=="1" goto SETUP
if "%choice%"=="2" goto RUN_ALL
if "%choice%"=="3" goto RUN_BACKEND
if "%choice%"=="4" goto RUN_FRONTEND
if "%choice%"=="5" goto BUILD_FRONTEND
if "%choice%"=="6" goto EXIT
goto MENU

:SETUP
cls
echo =====================================================================
echo                     INSTALLATION ^& DEPENDENCY SETUP
echo =====================================================================
echo.
echo 1. Installing Node.js dependencies...
call npm.cmd install
if %errorlevel% neq 0 (
    echo [ERROR] Node.js dependencies installation failed.
    pause
    goto MENU
)
echo.
echo 2. Setting up Python Virtual Environment (venv)...
if not exist "backend\venv" (
    python -m venv backend\venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create Python virtual environment. Please check if Python is in your PATH.
        pause
        goto MENU
    )
)
echo.
echo 3. Installing Python dependencies...
call backend\venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Python dependencies installation failed.
    pause
    goto MENU
)
echo.
echo =====================================================================
echo Setup completed successfully!
echo =====================================================================
pause
goto MENU

:RUN_ALL
cls
echo =====================================================================
echo                     STARTING BOTH SERVICES
echo =====================================================================
echo.
echo Starting Python Transcription Backend in a new window...
start "WhisperFlow Backend" cmd /c "cd /d %~dp0 && call backend\venv\Scripts\activate.bat && python backend\whisper_server.py"

echo.
echo Starting Next.js Dev Frontend in this window...
echo App will be available at http://localhost:3000
echo.
call npm.cmd run dev
pause
goto MENU

:RUN_BACKEND
cls
echo =====================================================================
echo                     STARTING TRANSCRIPTION BACKEND
echo =====================================================================
echo.
call backend\venv\Scripts\activate.bat
python backend\whisper_server.py
pause
goto MENU

:RUN_FRONTEND
cls
echo =====================================================================
echo                     STARTING FRONTEND ONLY
echo =====================================================================
echo.
echo App will be available at http://localhost:3000
echo.
call npm.cmd run dev
pause
goto MENU

:BUILD_FRONTEND
cls
echo =====================================================================
echo                     BUILDING FRONTEND BUNDLE
echo =====================================================================
echo.
call npm.cmd run build
pause
goto MENU

:EXIT
echo.
echo Goodbye!
exit /b 0
