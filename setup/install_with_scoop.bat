@echo off
echo ========================================
echo Instalador via Scoop (Gerenciador de Pacotes)
echo ========================================
echo.

REM Verificar se Scoop está instalado
where scoop >nul 2>&1
if %errorlevel% neq 0 (
    echo Scoop nao encontrado. Instalando Scoop...
    echo.
    
    REM Instalar Scoop
    powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
    powershell -Command "irm get.scoop.sh | iex"
    
    echo.
    echo Scoop instalado! Feche este terminal e abra um novo.
    echo Depois execute este script novamente.
    pause
    exit /b 0
)

echo Scoop encontrado! Instalando Python...
echo.

REM Instalar Python via Scoop
scoop install python

echo.
echo ========================================
echo Python instalado com sucesso via Scoop!
echo ========================================
echo.

echo Verificando instalacao...
python --version

echo.
echo Instalando dependencias do projeto...
python -m pip install --upgrade pip
python -m pip install supabase requests python-dotenv schedule colorlog

echo.
echo ========================================
echo Instalacao completa!
echo ========================================
echo.

REM Criar arquivo .env se não existir
if not exist ".env" (
    echo Criando arquivo .env...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edite o arquivo .env com suas credenciais!
    notepad .env
)

echo Para executar o sistema: python main.py
echo.
pause