@echo off
echo ========================================
echo   INSTALACAO COMPLETA DE DEPENDENCIAS
echo ========================================
echo.

REM Configurar Python no PATH
set PYTHON_PATH=C:\Users\gilma\AppData\Local\Programs\Python\Python312
set PATH=%PYTHON_PATH%;%PYTHON_PATH%\Scripts;%PATH%

echo [1/3] Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    pause
    exit /b 1
)

echo.
echo [2/3] Instalando dependencias Python...
echo ----------------------------------------
cd /d "C:\Users\gilma\Nova pasta (2)"
python -m pip install --upgrade pip
python -m pip install -r config\requirements.txt

echo.
echo [3/3] Verificando instalacao...
echo ----------------------------------------
python -c "import supabase; print('[OK] Supabase instalado')"
python -c "import requests; print('[OK] Requests instalado')"
python -c "import dotenv; print('[OK] Python-dotenv instalado')"

echo.
echo ========================================
echo   INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Servicos disponiveis:
echo - Backend Node.js: http://localhost:8081
echo - Frontend React: http://localhost:8082
echo.
echo Scripts Python prontos para uso:
echo - python run.py --status
echo - python run.py --sync
echo ========================================
pause