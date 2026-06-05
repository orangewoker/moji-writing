@echo off
setlocal EnableExtensions
chcp 65001 >nul

set "ROOT=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%deploy-portable.ps1" %*
set "CODE=%ERRORLEVEL%"

echo.
if "%CODE%"=="0" (
  echo Deploy finished successfully.
) else (
  echo Deploy failed with exit code %CODE%.
)
echo.
pause
exit /b %CODE%
