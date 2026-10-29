@echo off
cd /d "%~dp0"
echo Jobboard - Your next chapter
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 LTS first, then open this file again.
  pause
  exit /b 1
)
if not exist ".env.local" copy ".env.example" ".env.local" >nul
if not exist "node_modules\next\package.json" (
  echo Installing frontend packages. Please wait...
  call npm ci --ignore-scripts
  if errorlevel 1 (
    echo Installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
echo Keep your backend running in its own window.
echo Open http://localhost:3000 when the Ready message appears.
call npm run dev
pause
