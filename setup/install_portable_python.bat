@echo off
echo ========================================
echo Instalador Python Portable (Sem MS Store)
echo ========================================
echo.

set PYTHON_VERSION=3.12.0
set PYTHON_URL=https://www.python.org/ftp/python/%PYTHON_VERSION%/python-%PYTHON_VERSION%-embed-amd64.zip
set PIP_URL=https://bootstrap.pypa.io/get-pip.py
set INSTALL_DIR=%CD%\python_portable

echo Criando diretorio de instalacao...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo.
echo Baixando Python Portable %PYTHON_VERSION%...
echo URL: %PYTHON_URL%
echo.

REM Baixar Python usando PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%PYTHON_URL%' -OutFile '%INSTALL_DIR%\python.zip'}"

if not exist "%INSTALL_DIR%\python.zip" (
    echo [ERRO] Falha ao baixar Python!
    pause
    exit /b 1
)

echo Extraindo Python...
powershell -Command "Expand-Archive -Path '%INSTALL_DIR%\python.zip' -DestinationPath '%INSTALL_DIR%' -Force"

echo Configurando Python...
REM Criar arquivo python312._pth para habilitar pip
echo python312.zip > "%INSTALL_DIR%\python312._pth"
echo . >> "%INSTALL_DIR%\python312._pth"
echo Lib >> "%INSTALL_DIR%\python312._pth"
echo Lib\site-packages >> "%INSTALL_DIR%\python312._pth"

echo.
echo Baixando pip...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%PIP_URL%' -OutFile '%INSTALL_DIR%\get-pip.py'}"

echo Instalando pip...
"%INSTALL_DIR%\python.exe" "%INSTALL_DIR%\get-pip.py" --no-warn-script-location

echo.
echo ========================================
echo Python Portable instalado com sucesso!
echo ========================================
echo.

REM Criar arquivo de execucao
echo @echo off > run_python.bat
echo "%INSTALL_DIR%\python.exe" %%* >> run_python.bat

REM Criar arquivo para instalar dependencias
echo @echo off > install_deps.bat
echo echo Instalando dependencias do projeto... >> install_deps.bat
echo "%INSTALL_DIR%\python.exe" -m pip install --upgrade pip >> install_deps.bat
echo "%INSTALL_DIR%\python.exe" -m pip install supabase requests python-dotenv schedule colorlog >> install_deps.bat
echo echo. >> install_deps.bat
echo echo Dependencias instaladas! >> install_deps.bat
echo pause >> install_deps.bat

REM Criar arquivo para executar o sistema
echo @echo off > run_system.bat
echo echo ======================================== >> run_system.bat
echo echo Sistema de Sincronizacao iFood >> run_system.bat
echo echo ======================================== >> run_system.bat
echo echo. >> run_system.bat
echo if not exist ".env" ( >> run_system.bat
echo     echo Criando arquivo .env... >> run_system.bat
echo     copy .env.example .env >> run_system.bat
echo     echo. >> run_system.bat
echo     echo IMPORTANTE: Edite o arquivo .env com suas credenciais! >> run_system.bat
echo     notepad .env >> run_system.bat
echo ) >> run_system.bat
echo "%INSTALL_DIR%\python.exe" main.py >> run_system.bat
echo pause >> run_system.bat

echo Arquivos criados:
echo   - run_python.bat (para executar Python)
echo   - install_deps.bat (para instalar dependencias)
echo   - run_system.bat (para executar o sistema)
echo.
echo Deseja instalar as dependencias agora? (S/N)
choice /C SN /N
if %errorlevel% == 1 (
    call install_deps.bat
)

echo.
echo Instalacao concluida!
echo Use 'run_system.bat' para executar o sistema.
echo.
pause