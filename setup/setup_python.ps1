# Script PowerShell para configurar Python e dependências

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Completo - Sistema iFood" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para encontrar Python
function Find-Python {
    $pythonPaths = @(
        "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe",
        "$env:ProgramFiles\Python312\python.exe",
        "$env:ProgramFiles\Python311\python.exe",
        "C:\Python312\python.exe",
        "C:\Python311\python.exe"
    )
    
    foreach ($path in $pythonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Tentar comando direto
    try {
        $result = Get-Command python -ErrorAction SilentlyContinue
        if ($result) {
            return "python"
        }
    } catch {}
    
    try {
        $result = Get-Command py -ErrorAction SilentlyContinue
        if ($result) {
            return "py"
        }
    } catch {}
    
    return $null
}

# Procurar Python
Write-Host "Procurando Python..." -ForegroundColor Yellow
$pythonCmd = Find-Python

if (-not $pythonCmd) {
    Write-Host "[ERRO] Python não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Deseja instalar o Python agora? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Host "Baixando Python 3.12..." -ForegroundColor Yellow
        $url = "https://www.python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe"
        $installer = "$env:TEMP\python_installer.exe"
        
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        
        Write-Host "Instalando Python..." -ForegroundColor Yellow
        Start-Process -FilePath $installer -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1" -Wait
        
        Write-Host "Python instalado!" -ForegroundColor Green
        $pythonCmd = Find-Python
    } else {
        exit
    }
}

Write-Host "✓ Python encontrado: $pythonCmd" -ForegroundColor Green
& $pythonCmd --version

# Instalar dependências
Write-Host ""
Write-Host "Instalando dependências..." -ForegroundColor Yellow

& $pythonCmd -m pip install --upgrade pip
& $pythonCmd -m pip install supabase requests python-dotenv schedule colorlog

Write-Host ""
Write-Host "✓ Dependências instaladas!" -ForegroundColor Green

# Configurar .env
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "CONFIGURE SUAS CREDENCIAIS NO ARQUIVO .env" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Abrindo .env para edição..."
    notepad .env
    
    Write-Host ""
    Write-Host "Após configurar, pressione ENTER para continuar..."
    Read-Host
}

# Executar sistema
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "INICIANDO SISTEMA DE SINCRONIZAÇÃO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

& $pythonCmd main.py