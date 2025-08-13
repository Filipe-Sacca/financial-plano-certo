# 🚀 iFood Integration Hub

Sistema completo de integração com iFood que inclui **renovação automática de tokens a cada 3 horas**, sincronização de dados, dashboard web e automação via N8N.

## ⭐ **RECURSOS PRINCIPAIS**

- ✅ **Renovação automática de tokens** (a cada 3 horas)
- ✅ **Dashboard web interativo** (React + Supabase)
- ✅ **Sincronização de produtos e lojas**
- ✅ **Automação via N8N workflows**
- ✅ **Monitoramento em tempo real**
- ✅ **APIs RESTful**

## 🏗️ **ESTRUTURA DO PROJETO**

```
📁 iFood Integration Hub/
├── 🎯 run.py                      # LAUNCHER PRINCIPAL
├── 📋 package.json                # Configuração do projeto
│
├── 📁 src/                        # Código Python
│   ├── main.py                    # Script principal
│   ├── ifood_api_client.py        # Cliente API iFood
│   ├── ifood_product_sync.py      # Sincronização
│   └── config.py                  # Configurações
│
├── 📁 services/                   # Serviços Node.js
│   ├── ifood-token-service/       # ⭐ RENOVAÇÃO DE TOKENS
│   └── python_services/           # Serviços Python
│
├── 📁 frontend/                   # Dashboard Web
│   └── plano-certo-hub-insights/  # Interface React
│
├── 📁 n8n-workflows/             # Automação N8N
├── 📁 scripts-utils/             # Scripts utilitários
├── 📁 config/                    # Configurações
├── 📁 docs/                      # Documentação
├── 📁 setup/                     # Scripts de instalação
├── 📁 tests/                     # Testes
└── 📁 logs/                      # Logs do sistema
```

## 🚀 **INÍCIO RÁPIDO**

### **1. Verificar Status**
```bash
python run.py --status
```

### **2. Verificar Tokens**
```bash
python run.py --token-check
# ou
npm run token-check
```

### **3. Monitorar Tokens em Tempo Real**
```bash
npm run token-monitor
```

### **4. Sincronizar Dados**
```bash
python run.py --sync
# ou  
npm run sync
```

### **5. Iniciar Dashboard**
```bash
npm run dev:frontend
```

## 🔧 **COMANDOS DISPONÍVEIS**

### **NPM Scripts:**
```bash
npm start                 # Status do sistema
npm run token-check       # Verificar tokens
npm run token-monitor     # Monitor em tempo real
npm run sync              # Sincronizar dados
npm run dev:frontend      # Dashboard (dev)
npm run dev:token-service # Serviço de tokens (dev)
npm run setup             # Instalação completa
```

### **Python Scripts:**
```bash
python run.py --status           # Status geral
python run.py --sync             # Sincronização
python run.py --token-check      # Verificar tokens
python run.py --api-server       # Servidor API
python run.py --merchant-status  # Status das lojas
```

## ⚙️ **CONFIGURAÇÃO**

### **1. Variáveis de Ambiente**
Crie um arquivo `.env` na raiz:
```env
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
IFOOD_API_BASE_URL=https://merchant-api.ifood.com.br
```

### **2. Instalação de Dependências**
```bash
npm run setup
```

### **3. Configurar N8N Workflows**
Importe os workflows da pasta `n8n-workflows/`

## 🔐 **RENOVAÇÃO AUTOMÁTICA DE TOKENS**

O sistema possui **renovação automática a cada 3 horas**:

### **Arquivo Principal:**
- `services/ifood-token-service/src/ifoodTokenService.ts`

### **Scheduler:**
- `services/ifood-token-service/src/tokenScheduler.ts`

### **Verificação Manual:**
```bash
node scripts-utils/test-expiration-check.js
```

### **Monitoramento:**
```bash
node scripts-utils/monitor-token-updates.js
```

## 📊 **DASHBOARD WEB**

Acesse o dashboard em: `http://localhost:5173`

### **Recursos:**
- ✅ Monitoramento de tokens
- ✅ Status das integrações
- ✅ Métricas em tempo real
- ✅ Gestão de produtos
- ✅ Relatórios

### **Iniciar:**
```bash
cd frontend/plano-certo-hub-insights
npm run dev
```

## 🔄 **AUTOMAÇÃO N8N**

### **Workflows Disponíveis:**
- `[CREATE] Token de Acesso.json` - Criação de tokens
- `[UPDATE] Atualiza o Token de Acesso.json` - Atualização
- `[MERCHANT] *.json` - Gestão de lojas
- `[PRODUCT] *.json` - Gestão de produtos

## 📁 **ESTRUTURA DETALHADA**

### **Serviços Core:**
```
services/ifood-token-service/     # ⭐ RENOVAÇÃO DE TOKENS
├── src/ifoodTokenService.ts      # Serviço principal
├── src/tokenScheduler.ts         # Scheduler (3h)
└── src/tokenRefreshService.ts    # Renovação alternativa
```

### **Frontend:**
```
frontend/plano-certo-hub-insights/
├── src/components/               # Componentes React
├── src/hooks/                    # Hooks personalizados
└── supabase/migrations/          # Migrações DB
```

### **Scripts Utilitários:**
```
scripts-utils/
├── monitor-token-updates.js      # Monitor em tempo real
├── test-expiration-check.js      # Teste de expiração
└── test-token-service.js         # Teste do serviço
```

## 🐛 **SOLUÇÃO DE PROBLEMAS**

### **Tokens não renovam:**
```bash
# Verificar status
python run.py --token-check

# Verificar logs
cat logs/ifood_sync.log

# Forçar renovação
node scripts-utils/test-expiration-check.js
```

### **Dashboard não carrega:**
```bash
cd frontend/plano-certo-hub-insights
npm install
npm run dev
```

### **Serviços não funcionam:**
```bash
# Reinstalar dependências
npm run setup

# Verificar configurações
python run.py --status
```

## 📞 **SUPORTE**

- 📖 **Documentação:** `docs/`
- 🔧 **Scripts de teste:** `tests/`
- 📊 **Logs:** `logs/`
- ⚙️ **Setup:** `setup/`

---

**🎉 Sistema completo e funcional com renovação automática de tokens a cada 3 horas!**