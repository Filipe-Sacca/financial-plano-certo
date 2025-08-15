@echo off
echo ========================================
echo Instalador e Executor do Sistema iFood
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    echo Execute primeiro: add_python_to_path.bat
    echo Depois abra um NOVO terminal.
    pause
    exit /b 1
)

echo Python detectado!
python --version
echo.

echo Instalando dependencias...
python -m pip install --upgrade pip
python -m pip install supabase requests python-dotenv schedule colorlog

echo.
echo ========================================
echo Dependencias instaladas!
echo ========================================
echo.

REM Configurar .env
if not exist ".env" (
    echo Criando arquivo .env...
    copy .env.example .env
    echo.
    echo CONFIGURE SUAS CREDENCIAIS:
    echo.
    notepad .env
    echo.
    pause
)

echo.
echo ========================================
echo EXECUTANDO SISTEMA
echo ========================================
echo.

python main.py

pause