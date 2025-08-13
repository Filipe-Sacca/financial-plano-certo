@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Executador Universal Python
echo ========================================
echo.

set PYTHON_CMD=
set PIP_CMD=

REM Testar diferentes comandos Python
for %%c in (python python3 py) do (
    %%c --version >nul 2>&1
    if !errorlevel! == 0 (
        set PYTHON_CMD=%%c
        set PIP_CMD=%%c -m pip
        goto :found
    )
)

REM Procurar Python em caminhos conhecidos do Windows
for %%p in (
    "%LOCALAPPDATA%\Programs\Python\Python312"
    "%LOCALAPPDATA%\Programs\Python\Python311"
    "%LOCALAPPDATA%\Programs\Python\Python310"
    "%LOCALAPPDATA%\Programs\Python\Python39"
    "%ProgramFiles%\Python312"
    "%ProgramFiles%\Python311"
    "%ProgramFiles%\Python310"
    "%ProgramFiles(x86)%\Python312"
    "C:\Python312"
    "C:\Python311"
    "C:\Python310"
) do (
    if exist "%%~p\python.exe" (
        set PYTHON_CMD=%%~p\python.exe
        set PIP_CMD=%%~p\python.exe -m pip
        goto :found
    )
)

echo [ERRO] Python nao encontrado!
echo.
echo O Python precisa ser instalado para executar este sistema.
echo.
echo Opcoes:
echo 1. Abra um novo terminal (CMD) e tente novamente
echo 2. Reinstale o Python de: https://www.python.org/downloads/
echo    (Marque "Add Python to PATH" durante a instalacao)
echo.
pause
exit /b 1

:found
echo Python encontrado: !PYTHON_CMD!
echo.

REM Verificar se as dependencias estao instaladas
echo Verificando dependencias...
!PYTHON_CMD! -c "import supabase" >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo Instalando dependencias necessarias...
    echo.
    !PIP_CMD! install --upgrade pip
    !PIP_CMD! install supabase requests python-dotenv schedule colorlog
    echo.
)

REM Verificar arquivo .env
if not exist ".env" (
    echo ========================================
    echo CONFIGURACAO INICIAL
    echo ========================================
    echo.
    echo Criando arquivo de configuracao .env...
    copy .env.example .env >nul
    echo.
    echo IMPORTANTE: Configure suas credenciais no arquivo .env
    echo.
    echo Abrindo .env para edicao...
    notepad .env
    echo.
    echo Apos configurar, pressione qualquer tecla para continuar...
    pause >nul
)

REM Executar o sistema
echo.
echo ========================================
echo INICIANDO SISTEMA DE SINCRONIZACAO
echo ========================================
echo.
!PYTHON_CMD! main.py

pause