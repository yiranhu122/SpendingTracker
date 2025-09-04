@echo off
echo ======================================
echo   SpendingTracker - NAS Mode
echo ======================================
echo.
echo Starting SpendingTracker for network access...
echo.

REM Set environment variables for NAS mode
set NAS_MODE=true
set HOST=0.0.0.0
set PORT=3001

echo Server will be accessible from network at:
echo   http://[YOUR-NAS-IP]:3001
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js

pause
