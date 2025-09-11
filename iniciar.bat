@echo off
REM Verifica se o ambiente virtual existe, se nao, cria.
IF NOT EXIST .\venv ( 
    echo [INFO] Criando ambiente virtual...
    python -m venv venv
) ELSE (
    echo [INFO] Ambiente virtual 'venv' ja existe.
)

REM Ativa o ambiente virtual e instala as dependencias
echo [INFO] Ativando ambiente virtual e instalando dependencias...
call .\venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [SUCCESS] Setup concluido.

echo [INFO] Iniciando a aplicacao... Pressione CTRL+C para parar.
echo.

REM Inicia o servidor Uvicorn
uvicorn src.main:app --reload
