@echo off
echo ========================================
echo Configuracao e Instalacao de Dependencias
echo ========================================
echo.

REM Tentar encontrar Python em diferentes locais
set PYTHON_CMD=

REM Verificar Python no PATH
python --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=python
    goto :found
)

REM Verificar py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=py
    goto :found
)

REM Verificar Python 3.12 no AppData
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe
    goto :found
)

REM Verificar Python 3.11 no AppData
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe
    goto :found
)

REM Verificar Python em Program Files
if exist "%ProgramFiles%\Python312\python.exe" (
    set PYTHON_CMD=%ProgramFiles%\Python312\python.exe
    goto :found
)

if exist "%ProgramFiles%\Python311\python.exe" (
    set PYTHON_CMD=%ProgramFiles%\Python311\python.exe
    goto :found
)

REM Verificar Python em Program Files (x86)
if exist "%ProgramFiles(x86)%\Python312\python.exe" (
    set PYTHON_CMD=%ProgramFiles(x86)%\Python312\python.exe
    goto :found
)

echo [ERRO] Python nao encontrado!
echo.
echo Por favor, instale o Python manualmente:
echo 1. Acesse: https://www.python.org/downloads/
echo 2. Baixe Python 3.12 ou superior
echo 3. Durante a instalacao, marque "Add Python to PATH"
echo.
pause
exit /b 1

:found
echo Python encontrado: %PYTHON_CMD%
echo.

echo Instalando dependencias...
"%PYTHON_CMD%" -m pip install --upgrade pip
"%PYTHON_CMD%" -m pip install supabase requests python-dotenv schedule colorlog

echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.

REM Verificar se .env existe
if not exist ".env" (
    echo Criando arquivo .env...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edite o arquivo .env com suas credenciais!
    echo.
)

echo Para executar o sistema, use:
echo "%PYTHON_CMD%" main.py
echo.
pause