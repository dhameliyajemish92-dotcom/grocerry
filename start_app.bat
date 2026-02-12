@echo off
echo ===========================================
echo   Starting Grocery Application
echo ===========================================
echo.
echo Starting Backend Server...
start "Grocery Server" cmd /k "cd server && npm start"
echo.
echo Starting Frontend Client...
start "Grocery Client" cmd /k "cd client && npm start"
echo.
echo App is starting in two new windows!
echo Please wait for "Connected to MongoDB" and "Compiled successfully".
pause
