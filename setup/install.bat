@echo off
echo ========================================
echo Instalando dependencias do projeto
echo ========================================
echo.

REM Tentando com diferentes comandos Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python encontrado. Instalando dependencias...
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    goto :success
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python3 encontrado. Instalando dependencias...
    python3 -m pip install --upgrade pip
    python3 -m pip install -r requirements.txt
    goto :success
)

py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Py launcher encontrado. Instalando dependencias...
    py -m pip install --upgrade pip
    py -m pip install -r requirements.txt
    goto :success
)

echo.
echo [ERRO] Python nao foi encontrado!
echo Por favor, instale o Python em: https://www.python.org/downloads/
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo Instalacao concluida com sucesso!
echo ========================================
echo.
echo Para executar o sistema, use: python main.py
echo.
pause