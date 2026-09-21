@echo off
setlocal enabledelayedexpansion
title QSR POS System - Database Backup

echo =======================================================
echo          QSR POS SYSTEM - INSTANT BACKUP
echo =======================================================
echo.

cd backend
call node scripts/backup-db.js
cd ..

echo.
pause
