@echo off
echo ========================================
echo Limpando arquivos de instalacao
echo ========================================
echo.

REM Remover scripts de instalacao do Python
del install.bat 2>nul
del install.ps1 2>nul
del install_python.bat 2>nul
del install_portable_python.bat 2>nul
del install_and_run.bat 2>nul
del install_with_scoop.bat 2>nul
del download_python_installer.bat 2>nul
del add_python_to_path.bat 2>nul
del find_and_use_python.bat 2>nul
del run_with_any_python.bat 2>nul
del setup_and_run.bat 2>nul
del setup_python.ps1 2>nul
del run.bat 2>nul
del cleanup.bat 2>nul

REM Remover instalador do Python
del python_installer.exe 2>nul

REM Remover documentacao de instalacao
del INSTRUCOES_INSTALACAO.md 2>nul

echo.
echo Arquivos removidos com sucesso!
echo.
echo ========================================
echo ARQUIVOS ESSENCIAIS MANTIDOS:
echo ========================================
echo.
echo Sistema Principal:
echo   - main.py (Script principal)
echo   - ifood_product_sync.py
echo   - supabase_client.py
echo   - ifood_api_client.py
echo   - product_processor.py
echo   - config.py
echo.
echo Configuracao:
echo   - .env (suas credenciais)
echo   - .env.example
echo   - requirements.txt
echo.
pause

REM Auto-deletar este script
del "%~f0"