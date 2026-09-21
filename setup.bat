@echo off
setlocal enabledelayedexpansion
title QSR POS System - Installation and Setup

echo =======================================================
echo          QSR POS SYSTEM - INITIAL SETUP
echo =======================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Ask for custom Cafe Database Name
echo Enter a unique database name for this cafe (e.g. mocha_bliss)
echo Press [ENTER] without typing to use default from configuration:
set /p DBNAME="Cafe Database Name: "

echo.
echo -------------------------------------------------------
echo [1/2] Creating and configuring cafe database...
echo -------------------------------------------------------
cd backend
if "%DBNAME%"=="" (
    call node scripts/init-db.js
) else (
    call node scripts/init-db.js %DBNAME%
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Database initialization failed!
    echo Please verify that your MySQL server is running and credentials in backend/.env are valid.
    cd ..
    pause
    exit /b 1
)

echo.
echo -------------------------------------------------------
echo [2/2] Synchronizing database tables and models...
echo -------------------------------------------------------
call npx prisma db push --skip-generate

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Prisma database push failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo =======================================================
echo       SETUP COMPLETE! SYSTEM IS READY TO USE
echo =======================================================
echo.
echo You can now launch the POS anytime by double-clicking:
echo   --^> start.bat
echo.
pause
