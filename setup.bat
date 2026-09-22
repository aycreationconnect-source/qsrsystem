@echo off
setlocal enabledelayedexpansion
title QSR POS System - Setup and Initialization

echo =======================================================
echo          QSR POS SYSTEM - FIRST TIME SETUP
echo =======================================================
echo.

:: 1. Verify Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Auto-check and install runtime dependencies if missing
if not exist "%~dp0backend\node_modules\@prisma\client" (
    echo -------------------------------------------------------
    echo [1/2] First-Time Setup: Installing production packages...
    echo Please wait, this takes about 30 to 45 seconds on first run...
    echo -------------------------------------------------------
    cd /d "%~dp0backend"
    call npm install --omit=dev --no-audit --no-fund
    call npx prisma generate
    cd /d "%~dp0"
    echo [OK] Runtime dependencies ready.
    echo.
)

:: 3. Initialize database from backend\.env configuration
echo -------------------------------------------------------
echo [1/2] Initializing Cafe Database from backend\.env ...
echo -------------------------------------------------------
cd /d "%~dp0backend"

call node scripts/init-db.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Database initialization failed!
    echo Please verify that MySQL Server is running and credentials in backend\.env are correct.
    cd /d "%~dp0"
    pause
    exit /b 1
)

echo.
echo -------------------------------------------------------
echo [2/2] Synchronizing database tables and models...
echo -------------------------------------------------------
call npx prisma db push --accept-data-loss

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Prisma table synchronization failed!
    cd /d "%~dp0"
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo =======================================================
echo     SETUP COMPLETE! QSR POS IS READY FOR LAUNCH
echo =======================================================
echo.
echo You can now start the POS system anytime by launching:
echo   --^> start.bat
echo.

pause
