@echo off
setlocal enabledelayedexpansion
title QSR POS System - Launcher

echo =======================================================
echo              STARTING QSR POS SYSTEM
echo =======================================================
echo.

:: 1. Verify MySQL connectivity
echo Checking MySQL Server connection (Port 3306)...
powershell -Command "$t = New-Object Net.Sockets.TcpClient; try { $t.Connect('127.0.0.1', 3306); $t.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Port 3306 is not reachable. Attempting to start MySQL service...
    net start MySQL80 >nul 2>&1
    net start MySQL >nul 2>&1
)

:: 2. Launch Backend in background daemon window
echo Starting QSR POS Engine...
start "QSR POS Server [Keep this window open while using POS]" cmd /k "cd /d %~dp0backend && node dist/main.js"

:: 3. Wait for server initialization
echo Waiting for server to initialize on http://localhost:3000 ...
timeout /t 3 /nobreak >nul

:: 4. Launch Desktop App Window (Edge standalone app mode)
echo Launching POS Desktop Interface...
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app=http://localhost:3000
    exit /b 0
)

set EDGE_PATH64="C:\Program Files\Microsoft\Edge\Application\msedge.exe"
if exist %EDGE_PATH64% (
    start "" %EDGE_PATH64% --app=http://localhost:3000
    exit /b 0
)

:: Fallback to default browser
start http://localhost:3000
exit /b 0
