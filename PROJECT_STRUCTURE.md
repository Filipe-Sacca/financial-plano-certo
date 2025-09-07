# 📁 Estrutura do Projeto - Plano Certo Hub Insights

## 🏗️ Estrutura Organizada

```
plano-certo-hub-insights/
│
├── 📱 frontend/                    # Aplicação Frontend
│   └── plano-certo-hub-insights/   # React + Vite + TypeScript
│       ├── src/
│       │   ├── components/         # Componentes React
│       │   ├── pages/             # Páginas da aplicação
│       │   ├── hooks/             # Custom hooks
│       │   ├── lib/               # Bibliotecas e utilitários
│       │   └── integrations/      # Integrações (Supabase, etc)
│       └── dist/                  # Build de produção
│
├── 🔧 services/                    # Microserviços Backend
│   └── ifood-token-service/       # Serviço de integração iFood
│       ├── src/                   # Código fonte TypeScript
│       ├── dist/                  # Código compilado
│       ├── tests/                 # Arquivos de teste
│       ├── migrations/            # Scripts SQL e migrações
│       └── scripts-temp/          # Scripts temporários
│
├── 🗄️ database/                    # Configurações de banco de dados
│   ├── schemas/                   # Esquemas das tabelas
│   └── migrations/                # Migrações gerais
│
├── 📚 docs/                        # Documentação do projeto
│   ├── DELIVERY_ANALYTICS_GUIDE.md
│   └── criterios_de_homologação_shipping.md
│
├── 🛠️ scripts/                     # Scripts utilitários
│
├── 🔐 config/                      # Arquivos de configuração
│
├── 🧪 tests/                       # Testes gerais do projeto
│
└── 📦 _old-files/                  # Arquivos antigos arquivados
```

## 🚀 Serviços Principais

### Frontend (Port 8082)
- **URL**: http://localhost:8082
- **Tech**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Módulos**:
  - 📦 Pedidos (Orders)
  - 🚚 Entregas (Shipping)
  - ⭐ Avaliações (Reviews)
  - 📊 Dashboard

### Backend iFood Service (Port 8085)
- **URL**: http://localhost:8085
- **Tech**: Node.js, TypeScript, Express
- **APIs**:
  - `/orders` - Gestão de pedidos
  - `/shipping` - Rastreamento de entregas
  - `/reviews` - Avaliações
  - `/merchants` - Configuração de lojas

## 📝 Scripts Úteis

### Frontend
```bash
cd frontend/plano-certo-hub-insights
npm run dev          # Desenvolvimento
npm run build        # Build produção
```

### Backend
```bash
cd services/ifood-token-service
npm run dev          # Desenvolvimento
npm run build        # Compilar TypeScript
npm start           # Produção
```

## 🗂️ Organização de Arquivos

### ✅ Estrutura Atual:
- **tests/**: Todos os arquivos de teste `.js`
- **migrations/**: Todos os arquivos `.sql`
- **scripts-temp/**: Scripts temporários e de migração
- **_old-files/**: Arquivos antigos e não utilizados

### 🧹 Limpeza Realizada:
- ✅ Movidos 20+ arquivos de teste para `tests/`
- ✅ Movidos 7 arquivos SQL para `migrations/`
- ✅ Arquivados scripts antigos em `_old-files/`
- ✅ Organizada estrutura de pastas

## 🔗 Links Importantes

- **Frontend**: http://localhost:8082
- **Backend API**: http://localhost:8085
- **Documentação API**: http://localhost:8085/api-docs
- **Health Check**: http://localhost:8085/health

## 🛡️ Variáveis de Ambiente

Certifique-se de ter os arquivos `.env` configurados:
- `/.env` - Variáveis globais
- `/services/ifood-token-service/.env` - Variáveis do serviço iFood

## 👥 Módulos do Sistema

1. **Gestão de Pedidos** - Receber e processar pedidos do iFood
2. **Rastreamento de Entregas** - Acompanhar entregadores em tempo real
3. **Avaliações** - Gerenciar e responder avaliações
4. **Dashboard** - Métricas e análises
5. **Configurações** - Horários, taxas e integrações