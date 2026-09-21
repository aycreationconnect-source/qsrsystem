@echo off
setlocal enabledelayedexpansion
title QSR POS System - Launcher

echo =======================================================
echo              STARTING QSR POS SYSTEM
echo =======================================================
echo.

:: 1. Verify initialization
if not exist "%~dp0backend\node_modules\@prisma\client" (
    echo [ERROR] QSR POS is not initialized yet!
    echo Missing runtime dependencies in backend\node_modules.
    echo.
    echo Please double-click "setup.bat" first to complete initial setup.
    echo.
    pause
    exit /b 1
)

:: 2. Verify MySQL connectivity
echo Checking MySQL Server connection (Port 3306)...
powershell -Command "$t = New-Object Net.Sockets.TcpClient; try { $t.Connect('127.0.0.1', 3306); $t.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Port 3306 is not reachable. Attempting to start MySQL Windows service...
    net start MySQL80 >nul 2>&1
    net start MySQL >nul 2>&1
)

:: 3. Launch Backend in background daemon window
echo Starting QSR POS Engine...
start "QSR POS Server [Keep open while using POS]" cmd /k "cd /d %~dp0backend && node dist/main.js"

:: 4. Actively wait for server to listen on port 3000 (up to 12 seconds)
echo Waiting for QSR POS Engine to become ready on http://localhost:3000 ...
set READY=0
for /l %%i in (1,1,12) do (
    if !READY! equ 0 (
        powershell -Command "$t = New-Object Net.Sockets.TcpClient; try { $t.Connect('127.0.0.1', 3000); $t.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
        if !errorlevel! equ 0 (
            set READY=1
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)

if !READY! equ 0 (
    echo.
    echo =======================================================
    echo [ERROR] QSR POS Server failed to start on port 3000!
    echo =======================================================
    echo Please check the "QSR POS Server" window for error details.
    echo Common reasons:
    echo   1. Database was not created - please run setup.bat first
    echo   2. MySQL server password mismatch in backend\.env
    echo   3. Port 3000 is already in use by another application
    echo.
    pause
    exit /b 1
)

echo [OK] Server is active and responding!

:: 5. Launch Desktop App Window (Edge standalone app mode)
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

:: Fallback to default system browser
start http://localhost:3000
exit /b 0
