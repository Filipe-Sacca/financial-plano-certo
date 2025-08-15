@echo off
echo ========================================
echo Baixador do Instalador Python Oficial
echo ========================================
echo.

set PYTHON_VERSION=3.12.0
set INSTALLER_URL=https://www.python.org/ftp/python/%PYTHON_VERSION%/python-%PYTHON_VERSION%-amd64.exe
set INSTALLER_NAME=python_installer.exe

echo Baixando Python %PYTHON_VERSION% instalador oficial...
echo.

REM Usar PowerShell para baixar
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host 'Baixando...' -ForegroundColor Yellow; Invoke-WebRequest -Uri '%INSTALLER_URL%' -OutFile '%INSTALLER_NAME%' -UseBasicParsing}"

if exist "%INSTALLER_NAME%" (
    echo.
    echo ========================================
    echo Download concluido com sucesso!
    echo ========================================
    echo.
    echo IMPORTANTE ao instalar:
    echo.
    echo 1. Execute: %INSTALLER_NAME%
    echo 2. MARQUE a opcao: [X] Add Python to PATH
    echo 3. Clique em "Install Now"
    echo 4. Aguarde a instalacao
    echo 5. Feche e abra um novo terminal
    echo.
    echo Deseja executar o instalador agora? (S/N)
    choice /C SN /N
    if %errorlevel% == 1 (
        start %INSTALLER_NAME%
    )
) else (
    echo.
    echo [ERRO] Falha no download!
    echo.
    echo Alternativa: Baixe manualmente em:
    echo https://www.python.org/downloads/
    echo.
)

pause