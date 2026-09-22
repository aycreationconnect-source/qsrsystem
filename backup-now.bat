@echo off
setlocal enabledelayedexpansion
title QSR POS System - Instant Database Backup

echo =======================================================
echo          QSR POS - INSTANT DATABASE BACKUP
echo =======================================================
echo.

cd /d "%~dp0backend"
call node scripts/backup-db.js

cd /d "%~dp0"
echo.
pause
