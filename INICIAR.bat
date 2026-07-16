@echo off
chcp 65001 >nul
title Fit House Academia - Site
cd /d "%~dp0"
echo.
echo ===========================================
echo   FIT HOUSE ACADEMIA - SITE INSTITUCIONAL
echo ===========================================
echo.
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo Nao foi possivel concluir o npm install.
  pause
  exit /b 1
)
echo.
echo O site sera aberto em http://localhost:5173
start "" http://localhost:5173
call npm run dev
pause
