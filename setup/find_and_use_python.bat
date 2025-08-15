@echo off
echo ========================================
echo Localizador e Configurador do Python
echo ========================================
echo.

set PYTHON_FOUND=
set PYTHON_PATH=

REM Lista de possíveis localizações do Python
set LOCATIONS[0]=%LOCALAPPDATA%\Programs\Python\Python312\python.exe
set LOCATIONS[1]=%LOCALAPPDATA%\Programs\Python\Python311\python.exe
set LOCATIONS[2]=%LOCALAPPDATA%\Programs\Python\Python310\python.exe
set LOCATIONS[3]=%LOCALAPPDATA%\Programs\Python\Python39\python.exe
set LOCATIONS[4]=%LOCALAPPDATA%\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\python.exe
set LOCATIONS[5]=%LOCALAPPDATA%\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe
set LOCATIONS[6]=C:\Python312\python.exe
set LOCATIONS[7]=C:\Python311\python.exe
set LOCATIONS[8]=C:\Python310\python.exe
set LOCATIONS[9]=C:\Python39\python.exe
set LOCATIONS[10]=%ProgramFiles%\Python312\python.exe
set LOCATIONS[11]=%ProgramFiles%\Python311\python.exe
set LOCATIONS[12]=%ProgramFiles(x86)%\Python312\python.exe
set LOCATIONS[13]=%LOCALAPPDATA%\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\python.exe

echo Procurando Python instalado...
echo.

REM Verificar cada localização
for /L %%i in (0,1,13) do (
    call set "LOCATION=%%LOCATIONS[%%i]%%"
    if exist "!LOCATION!" (
        echo Encontrado: !LOCATION!
        set PYTHON_PATH=!LOCATION!
        goto :found
    )
)

REM Tentar com where
for /f "tokens=*" %%i in ('where python 2^>nul') do (
    if exist "%%i" (
        echo Encontrado no PATH: %%i
        set PYTHON_PATH=%%i
        goto :found
    )
)

echo [ERRO] Python não encontrado nas localizações conhecidas!
echo.
echo Tente executar o instalador novamente.
pause
exit /b 1

:found
echo.
echo ========================================
echo Python encontrado!
echo ========================================
echo Caminho: %PYTHON_PATH%
echo.

REM Verificar versão
echo Versão:
"%PYTHON_PATH%" --version

echo.
echo Instalando dependências do projeto...
echo.

"%PYTHON_PATH%" -m pip install --upgrade pip
"%PYTHON_PATH%" -m pip install supabase requests python-dotenv schedule colorlog

echo.
echo ========================================
echo Dependências instaladas!
echo ========================================
echo.

REM Criar script de execução personalizado
echo @echo off > run_ifood_sync.bat
echo echo ======================================== >> run_ifood_sync.bat
echo echo Sistema de Sincronização iFood >> run_ifood_sync.bat
echo echo ======================================== >> run_ifood_sync.bat
echo echo. >> run_ifood_sync.bat
echo if not exist ".env" ( >> run_ifood_sync.bat
echo     echo Criando arquivo .env... >> run_ifood_sync.bat
echo     copy .env.example .env >> run_ifood_sync.bat
echo     echo. >> run_ifood_sync.bat
echo     echo IMPORTANTE: Edite o arquivo .env com suas credenciais! >> run_ifood_sync.bat
echo     notepad .env >> run_ifood_sync.bat
echo     pause >> run_ifood_sync.bat
echo ) >> run_ifood_sync.bat
echo "%PYTHON_PATH%" main.py >> run_ifood_sync.bat
echo pause >> run_ifood_sync.bat

echo Script criado: run_ifood_sync.bat
echo.
echo Para executar o sistema, use: run_ifood_sync.bat
echo.
pause