@echo off
REM Script para agendar limpeza de logs iFood no Windows Task Scheduler
REM Executa todos os dias às 6:00 da manhã

echo 🧹 iFood Log Cleanup - Daily Execution
echo ⏰ Scheduled for 6:00 AM daily
echo.

REM Change to the service directory where .env file is located
cd /d "C:\Users\gilma\Nova pasta (2)\services\ifood-token-service"

REM Execute the cleanup script
echo 🚀 Starting log cleanup...
node "../../scripts/cleanup-polling-logs.js"

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo ✅ Log cleanup completed successfully
    echo 📊 Check console output above for details
) else (
    echo ❌ Log cleanup failed with error code %ERRORLEVEL%
    echo 🔍 Check logs for troubleshooting
)

echo.
echo 🕕 Next cleanup scheduled for tomorrow at 6:00 AM
pause