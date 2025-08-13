@echo off
echo ========================================
echo  iFood Integration Services Startup
echo ========================================
echo.

echo [1/2] Iniciando o iFood Token Service na porta 8081...
cd /d "%~dp0\services\ifood-token-service"
start "iFood Token Service" cmd /k "npm run dev"

echo [2/2] Aguardando 3 segundos antes de iniciar o frontend...
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando o Frontend na porta 5173...
cd /d "%~dp0\frontend\plano-certo-hub-insights"
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo  Serviços iniciados com sucesso!
echo ========================================
echo.
echo - iFood Token Service: http://localhost:8081
echo - Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para sair...
pause > nul