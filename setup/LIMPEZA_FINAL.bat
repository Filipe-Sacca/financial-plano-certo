@echo off
echo ========================================
echo LIMPEZA FINAL - Removendo TODOS os arquivos de instalacao
echo ========================================
echo.

echo Removendo arquivos de instalacao...

REM Deletar TODOS os scripts de instalacao
del add_python_to_path.bat 2>nul
del clean_installation_files.bat 2>nul
del cleanup.bat 2>nul
del download_python_installer.bat 2>nul
del find_and_use_python.bat 2>nul
del install_and_run.bat 2>nul
del install_portable_python.bat 2>nul
del install_python.bat 2>nul
del install_with_scoop.bat 2>nul
del install.bat 2>nul
del install.ps1 2>nul
del run_with_any_python.bat 2>nul
del run.bat 2>nul
del setup_and_run.bat 2>nul
del setup_python.ps1 2>nul
del INSTRUCOES_INSTALACAO.md 2>nul
del python_installer.exe 2>nul
del nul 2>nul

echo.
echo ========================================
echo LIMPEZA CONCLUIDA!
echo ========================================
echo.
echo Arquivos ESSENCIAIS mantidos:
echo   - main.py (principal)
echo   - ifood_product_sync.py
echo   - ifood_api_client.py
echo   - supabase_client.py
echo   - product_processor.py
echo   - config.py
echo   - requirements.txt
echo   - .env (configuracao)
echo.
echo Para executar o sistema:
echo python main.py
echo.
pause

REM Auto-deletar este script de limpeza
(goto) 2>nul & del "%~f0"