@echo off
echo ========================================
echo Instalador Automatico de Python
echo ========================================
echo.

REM Verificar se o Python já está instalado
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python ja esta instalado!
    goto :install_deps
)

echo Python nao encontrado. Instalando...
echo.

REM Verificar se winget está disponível
winget --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Winget nao encontrado!
    echo.
    echo Por favor, instale o Python manualmente:
    echo 1. Abra a Microsoft Store
    echo 2. Pesquise por "Python 3.12"
    echo 3. Clique em Instalar
    echo.
    echo Ou baixe em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Instalando Python via winget...
winget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements

echo.
echo Verificando instalacao...
timeout /t 3 >nul

REM Recarregar PATH
call refreshenv >nul 2>&1

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Python instalado mas precisa reiniciar o terminal.
    echo Por favor:
    echo 1. Feche este terminal
    echo 2. Abra um novo terminal
    echo 3. Execute install.bat novamente
    echo.
    pause
    exit /b 0
)

:install_deps
echo.
echo Python instalado com sucesso!
echo Instalando dependencias do projeto...
echo.
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.
echo Para executar o sistema: python main.py
echo.
pause