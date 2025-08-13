# 🏢 Plano Certo Hub - Sistema Integrado iFood

## 📁 Estrutura Organizada do Projeto

```
📂 Plano Certo Hub/
│
├── 📂 frontend/                     # 🎨 Aplicações Frontend
│   ├── plano-certo-hub-insights/   # Dashboard principal React/TypeScript
│   └── ccflare/                     # Aplicação secundária
│
├── 📂 backend/                      # 🖥️ Servidor Backend Node.js
│   ├── server.js                    # Servidor Express principal
│   ├── test-server.js              # Servidor de testes
│   └── .env                        # Variáveis de ambiente
│
├── 📂 services/                     # ⚙️ Microserviços
│   ├── ifood-token-service/        # Serviço de tokens OAuth2 iFood
│   │   ├── src/                    # Código fonte TypeScript
│   │   └── .env                    # Configurações do serviço
│   └── python_services/            # Serviços Python alternativos
│       ├── ifood_token_service.py
│       └── ifood_merchant_service.py
│
├── 📂 database/                     # 🗄️ Banco de Dados
│   └── supabase/                   # Configurações Supabase
│       ├── config.toml
│       └── migrations/             # Migrações SQL
│
├── 📂 scripts-utils/                # 🛠️ Scripts Utilitários
│   ├── check-*.js                  # Scripts de verificação
│   ├── create-*.js                 # Scripts de criação
│   └── db-tools.js                 # Ferramentas de banco
│
├── 📂 documentation/                # 📚 Documentação
│   ├── DOCUMENTACAO_APIs_IFOOD.md
│   ├── TOKEN_AUTO_RENEWAL.md
│   └── MERCHANT_STATUS_SERVICE.md
│
├── 📂 n8n-workflows/                # 🔄 Workflows N8N
│   ├── [CREATE] Token de Acesso.json
│   └── [MERCHANT-STATUS] Verifica se a loja esta aberta.json
│
└── 📂 exports/                      # 📤 Arquivos Exportados
    └── (PDFs, relatórios gerados)
```

## 🚀 Como Executar o Sistema Completo

### 1️⃣ Frontend (Dashboard Principal)
```bash
cd frontend/plano-certo-hub-insights
npm install
npm run dev
# Acesse: http://localhost:5173
```

### 2️⃣ Backend (API Server)
```bash
cd backend
npm install
node server.js
# Rodando na porta 8080
```

### 3️⃣ Serviço de Token iFood
```bash
cd services/ifood-token-service
npm install
npm run dev
# Rodando na porta 8081
```

### 4️⃣ Serviços Python (Opcional)
```bash
cd services/python_services
pip install -r requirements.txt
python api_server.py
# Rodando na porta 8000
```

## 🔧 Configuração de Ambiente

Todos os arquivos `.env` já estão configurados:
- ✅ `backend/.env` - Porta 8080
- ✅ `services/ifood-token-service/.env` - Porta 8081
- ✅ `frontend/plano-certo-hub-insights/.env` - Frontend

## 📋 Descrição dos Componentes

### Frontend
- **plano-certo-hub-insights**: Dashboard React com análises e relatórios
- **ccflare**: Aplicação adicional com TUI e servidor

### Backend
- Servidor Express.js que gerencia APIs e integrações

### Services
- **ifood-token-service**: Gerenciamento de tokens OAuth2 do iFood
  - Renovação automática de tokens
  - Verificação de validade
  - Scheduler preventivo
- **python_services**: Implementações alternativas em Python

### Database
- Configurações e migrações do Supabase
- Tabelas: tokens, merchants, products, clients

### Scripts-Utils
- Ferramentas de desenvolvimento e manutenção
- Scripts de verificação e criação de dados

### N8N-Workflows
- Workflows exportados do N8N para automação

## 🌐 Arquitetura

```
Frontend (React) ←→ Backend (Express) ←→ Supabase
                           ↓
                  Token Service (Node.js)
                           ↓
                      iFood API
```

## 📞 Suporte

Consulte a documentação em `documentation/` para mais detalhes sobre cada módulo.