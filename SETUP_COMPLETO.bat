@echo off
echo ========================================
echo    CONFIGURACAO COMPLETA - PYTHON E UV
echo ========================================
echo.

REM Definir caminhos
set PYTHON_PATH=C:\Users\gilma\AppData\Local\Programs\Python\Python312
set UV_PATH=C:\Users\gilma\.local\bin

REM Adicionar ao PATH da sessao atual
set PATH=%PYTHON_PATH%;%PYTHON_PATH%\Scripts;%UV_PATH%;%PATH%

echo Testando Python...
echo ----------------------------------------
python --version
if %errorlevel% equ 0 (
    echo [OK] Python funcionando!
) else (
    echo [ERRO] Python nao encontrado!
)

echo.
echo Testando Python3...
echo ----------------------------------------
python3 --version
if %errorlevel% equ 0 (
    echo [OK] Python3 funcionando!
) else (
    echo [AVISO] Python3 nao encontrado, criando alias...
    copy "%PYTHON_PATH%\python.exe" "%PYTHON_PATH%\python3.exe" >nul 2>&1
)

echo.
echo Testando UV...
echo ----------------------------------------
uv --version
if %errorlevel% equ 0 (
    echo [OK] UV funcionando!
) else (
    echo [ERRO] UV nao encontrado!
)

echo.
echo ========================================
echo COMANDOS DISPONIVEIS NESTE TERMINAL:
echo ========================================
echo python --version
echo python3 --version
echo uv --version
echo uv sync
echo uv pip install [pacote]
echo.
echo Para usar em QUALQUER terminal, execute:
echo   CONFIGURAR_PATH_PERMANENTE.bat
echo ========================================
echo.
cmd /k