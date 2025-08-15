@echo off
echo ========================================
echo Adicionar Python ao PATH do Sistema
echo ========================================
echo.

REM Procurar onde o Python está instalado
set PYTHON_PATH=

for %%p in (
    "%LOCALAPPDATA%\Programs\Python\Python312"
    "%LOCALAPPDATA%\Programs\Python\Python311"
    "%LOCALAPPDATA%\Programs\Python\Python310"
    "%ProgramFiles%\Python312"
    "%ProgramFiles%\Python311"
    "C:\Python312"
    "C:\Python311"
) do (
    if exist "%%~p\python.exe" (
        set PYTHON_PATH=%%~p
        goto :found
    )
)

echo Python nao encontrado nos caminhos padrao.
echo Tentando localizar via registro...

REM Buscar no registro
for /f "tokens=*" %%a in ('reg query HKLM\SOFTWARE\Python\PythonCore /s /f InstallPath 2^>nul ^| findstr "InstallPath"') do (
    echo Encontrado no registro: %%a
)

pause
exit /b 1

:found
echo Python encontrado em: %PYTHON_PATH%
echo.

echo Adicionando ao PATH do usuario...
setx PATH "%PYTHON_PATH%;%PYTHON_PATH%\Scripts;%PATH%" >nul 2>&1

echo.
echo ========================================
echo PATH atualizado com sucesso!
echo ========================================
echo.
echo IMPORTANTE: 
echo 1. Feche este terminal
echo 2. Abra um NOVO terminal (CMD)
echo 3. Execute: python --version
echo 4. Se funcionar, execute: install_and_run.bat
echo.
pause