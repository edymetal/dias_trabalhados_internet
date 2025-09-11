# GEMINI.md - Contexto do Projeto

## Visão Geral do Projeto

Este é um aplicativo web para "Controle de Dias Trabalhados", desenvolvido para gerenciar e calcular dias de trabalho e pagamentos. Ele consiste em um backend FastAPI em Python e um frontend interativo baseado em HTML, CSS e JavaScript.

**Tecnologias Principais:**
*   **Backend:** Python 3.x, FastAPI, SQLAlchemy (ORM), SQLite (banco de dados).
*   **Frontend:** HTML5, CSS3 (Bootstrap para estilização), JavaScript.

**Arquitetura:**
O projeto segue uma arquitetura cliente-servidor. O frontend (servido por `index.html` e seus ativos estáticos) interage com o backend FastAPI através de uma API RESTful para persistir e recuperar dados de um banco de dados SQLite.

## Construção e Execução

O projeto utiliza um ambiente virtual Python para gerenciar suas dependências e um script `.bat` para facilitar a configuração e execução.

### Pré-requisitos

*   Python 3.x instalado.

### Configuração e Inicialização

1.  **Executar o script de inicialização:**
    O script `iniciar.bat` automatiza a criação do ambiente virtual, a instalação das dependências e a inicialização do servidor.

    ```bash
    iniciar.bat
    ```

    Este script irá:
    *   Verificar e criar um ambiente virtual (`venv`) se ele não existir.
    *   Ativar o ambiente virtual.
    *   Instalar as dependências listadas em `requirements.txt` (`fastapi`, `uvicorn`, `sqlalchemy`).
    *   Iniciar o servidor Uvicorn em modo de recarregamento (`--reload`), que monitora as alterações no código e reinicia o servidor automaticamente.

2.  **Acessar a Aplicação:**
    Após a execução do `iniciar.bat`, o servidor FastAPI estará rodando. Você pode acessar a aplicação abrindo seu navegador e navegando para o endereço fornecido pelo Uvicorn (geralmente `http://127.0.0.1:8000`).

### Dependências

As dependências do projeto são gerenciadas via `pip` e listadas em `requirements.txt`:

*   `fastapi`: Framework web para construção de APIs.
*   `uvicorn`: Servidor ASGI para executar aplicações FastAPI.
*   `sqlalchemy`: Toolkit SQL e Object-Relational Mapper (ORM).

## Convenções de Desenvolvimento

*   **Estrutura de Pastas:**
    *   `src/`: Contém o código-fonte Python do backend (`main.py`, `database.py`).
    *   `static/`: Contém os ativos do frontend (`index.html`, `css/`, `js/`).
    *   `venv/`: Ambiente virtual Python.
*   **Banco de Dados:** Utiliza SQLite com o arquivo `dias_trabalhados.db` na raiz do projeto. As tabelas são criadas automaticamente na inicialização do aplicativo se não existirem.
*   **Modelos de Dados:** Definidos em `src/database.py` usando SQLAlchemy, incluindo `WorkLog`, `Settings` e `WeeklyPayment`.
*   **APIs:** Definidas em `src/main.py` usando FastAPI, com endpoints para manipulação de logs de trabalho, configurações e resumos.
*   **Frontend:** A lógica de interação do usuário e a renderização do calendário são implementadas em `static/js/app.js`.
*   **Estilo de Código:** O código Python segue as convenções gerais do Python. O JavaScript utiliza padrões modernos e interage com o DOM para atualizar a interface do usuário.

---
