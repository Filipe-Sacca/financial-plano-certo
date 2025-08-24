# Estrutura do Projeto - Plano Certo Hub Insights

## 📁 Organização dos Diretórios

### Diretórios Principais
- **backend/** - Código do servidor backend
- **frontend/** - Aplicação React (plano-certo-hub-insights)
- **services/** - Microserviços (ifood-token-service, etc.)
- **database/** - Estrutura e configuração do banco de dados
- **database-schemas/** - Esquemas e modelos de dados

### Diretórios de Suporte
- **scripts/** - Scripts utilitários e automação
  - check-db-direct.js
  - check-users-database.js
  - cleanup-test-orders.js
  - generate-ifood-checklist-pdf.js
  - cleanup-polling-logs.js
  - schedule-log-cleanup.bat

- **sql/** - Arquivos SQL para migrations e queries
  - create_ifood_categories_table.sql
  - fix_ifood_orders_schema.sql

- **tests/** - Arquivos de teste
  - test-category-creation.js
  - test-check-tokens.js
  - test-find-user.js

- **docs/** - Documentação do projeto
  - Checklist_IfoodHub.html
  - Checklist_IfoodHub.md
  - Checklist_IfoodHub_PDF.md
  - deploy-checklist-to-github.md
  - cc_genui_ifood_homologation_status_*.html
  - LOG_CLEANUP_SETUP.md

- **documentation/** - Documentação técnica adicional

- **config/** - Arquivos de configuração
- **setup/** - Scripts de configuração inicial
- **logs/** - Arquivos de log
- **temp/** - Arquivos temporários
- **exports/** - Dados exportados
- **n8n-workflows/** - Workflows de automação N8N
- **ccflare/** - Integração CCFlare
- **SuperClaude_Framework/** - Framework SuperClaude

### Diretórios de Desenvolvimento
- **.vscode/** - Configurações do VS Code
- **.git/** - Controle de versão Git
- **.venv/** - Ambiente virtual Python
- **node_modules/** - Dependências Node.js
- **__pycache__/** - Cache Python

## 📝 Arquivos na Raiz
- **.env** - Variáveis de ambiente (não versionado)
- **.env.example** - Exemplo de variáveis de ambiente
- **.gitignore** - Arquivos ignorados pelo Git
- **package.json** - Dependências e scripts Node.js
- **README.md** - Documentação principal do projeto
- **PROJECT_STRUCTURE.md** - Este arquivo

## 🚀 Estrutura Limpa
Todos os arquivos foram organizados em suas respectivas pastas:
- ✅ Arquivos SQL movidos para `sql/`
- ✅ Scripts JS movidos para `scripts/`
- ✅ Testes movidos para `tests/`
- ✅ Documentação movida para `docs/`
- ✅ Arquivos desnecessários removidos