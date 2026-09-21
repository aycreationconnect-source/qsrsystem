@echo off
setlocal enabledelayedexpansion
title QSR POS System - Setup & Initialization

echo =======================================================
echo          QSR POS SYSTEM - FIRST TIME SETUP
echo =======================================================
echo.

:: 1. Verify Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Optional Cafe Database Name prompt
echo Specify the database name for this cafe (e.g. mocha_bliss, central_cafe).
echo Or press [ENTER] without typing to use the name defined in configuration:
set /p CAFE_DB="Cafe Database Name: "

echo.
echo -------------------------------------------------------
echo [1/2] Initializing Cafe Database in MySQL...
echo -------------------------------------------------------
cd /d "%~dp0backend"

if "%CAFE_DB%"=="" (
    call node scripts/init-db.js
) else (
    call node scripts/init-db.js %CAFE_DB%
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Database creation failed!
    echo Please verify that MySQL Server is running and credentials in backend\.env are correct.
    cd /d "%~dp0"
    pause
    exit /b 1
)

echo.
echo -------------------------------------------------------
echo [2/2] Synchronizing Database Models & Tables...
echo -------------------------------------------------------
call npx prisma db push --skip-generate

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
