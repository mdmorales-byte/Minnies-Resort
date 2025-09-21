@echo off
echo ========================================
echo   Minnie's Farm Resort - Database Setup
echo ========================================
echo.

echo Starting MongoDB (if not running)...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo MongoDB service not found or already running
    echo Please ensure MongoDB is installed and running
    echo.
)

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend...
cd ..
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend:    http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close this window when you're done.
echo.
pause
