@echo off
echo Procurando instalacao do Python...

:: Locais comuns do Python
if exist "C:\Python312\python.exe" (
    set PYTHON_PATH=C:\Python312
    goto :found
)
if exist "C:\Program Files\Python312\python.exe" (
    set PYTHON_PATH=C:\Program Files\Python312
    goto :found
)
if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe" (
    set PYTHON_PATH=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312
    goto :found
)

echo Python 3.12 nao encontrado nos locais padrao!
echo Por favor, instale o Python primeiro.
pause
exit /b 1

:found
echo Python encontrado em: %PYTHON_PATH%
echo.
echo Adicionando ao PATH do usuario...
setx PATH "%PYTHON_PATH%;%PYTHON_PATH%\Scripts;%PATH%"
echo.
echo ✅ PATH atualizado!
echo.
echo IMPORTANTE: Feche e abra um novo terminal para as mudancas terem efeito!
echo.
pause