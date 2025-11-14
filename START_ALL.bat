@echo off
echo ========================================
echo  SurakshaNet - Starting All Services
echo ========================================
echo.

echo [1/3] Starting Node.js Blockchain Server...
start "Blockchain Server" cmd /k "cd blockchain && npm start"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Unified Backend (Flask + FastAPI)...
start "Backend Service" cmd /k "cd backend && py app.py"
timeout /t 5 /nobreak >nul

echo [3/3] Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  All Services Started!
echo ========================================
echo.
echo  Blockchain:   http://localhost:3001
echo  Backend:      http://localhost:5000
echo  System Stats: http://localhost:8001
echo  Frontend:     http://localhost:5173
echo.
echo  Press any key to exit this window...
pause >nul
