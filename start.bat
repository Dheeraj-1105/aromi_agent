@echo off
echo.
echo ============================================================
echo   AroMi AI Health Coach - Starting Services
echo ============================================================
echo.

:: Start backend
echo [1/2] Starting Backend (FastAPI)...
start "AroMi Backend" cmd /k "cd /d d:\aromi_agent\aromi\backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment
timeout /t 3 /nobreak >nul

:: Start frontend
echo [2/2] Starting Frontend (Vite)...
start "AroMi Frontend" cmd /k "cd /d d:\aromi_agent\aromi\frontend && npm run dev"

echo.
echo ============================================================
echo   Services starting...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo ============================================================
echo.
echo Press any key to close this window...
pause >nul
