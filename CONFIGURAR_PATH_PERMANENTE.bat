@echo off
echo ========================================
echo  CONFIGURANDO PATH PERMANENTEMENTE
echo ========================================
echo.

REM Executar PowerShell como administrador para configurar PATH
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-ExecutionPolicy Bypass -Command \"[Environment]::SetEnvironmentVariable(''Path'', ''C:\Users\gilma\AppData\Local\Programs\Python\Python312;C:\Users\gilma\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\gilma\.local\bin;'' + [Environment]::GetEnvironmentVariable(''Path'', ''Machine''), ''Machine''); Write-Host ''PATH configurado permanentemente!''; pause\"'"

echo.
echo PATH configurado! 
echo.
echo IMPORTANTE: Feche TODOS os terminais e abra um novo!
echo.
pause