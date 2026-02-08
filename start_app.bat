@echo off
echo ===========================================
echo   Starting RabbitMart Application
echo ===========================================
echo.
echo Starting Backend Server...
start "RabbitMart Server" cmd /k "cd server && npm start"
echo.
echo Starting Frontend Client...
start "RabbitMart Client" cmd /k "cd client && npm start"
echo.
echo App is starting in two new windows!
echo Please wait for "Connected to MongoDB" and "Compiled successfully".
pause
