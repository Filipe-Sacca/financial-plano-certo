# 🚀 Guia Completo de Instalação e Configuração

## Índice
1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Preparação do Ambiente](#preparação-do-ambiente)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Instalação do Backend](#instalação-do-backend)
5. [Instalação do Token Service](#instalação-do-token-service)
6. [Instalação do Frontend](#instalação-do-frontend)
7. [Configuração do iFood API](#configuração-do-ifood-api)
8. [Execução do Sistema](#execução-do-sistema)
9. [Verificação e Testes](#verificação-e-testes)
10. [Troubleshooting](#troubleshooting)

## Requisitos do Sistema

### Software Necessário
- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior
- **Git**: v2.30.0 ou superior
- **PostgreSQL**: v14.0 ou superior (via Supabase)
- **VS Code** ou outro editor (recomendado)

### Hardware Mínimo
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disco**: 10GB livres
- **Internet**: Conexão estável

## Preparação do Ambiente

### 1. Clonar o Repositório
```bash
# Clone o repositório
git clone [URL_DO_SEU_REPOSITORIO]
cd plano-certo-hub

# Verifique a estrutura
ls -la
# Deve mostrar: frontend/, backend/, services/, docs/
```

### 2. Instalar Node.js
```bash
# Verificar se já está instalado
node --version  # Deve mostrar v18.x.x ou superior
npm --version   # Deve mostrar v9.x.x ou superior

# Se não estiver instalado, baixe de:
# https://nodejs.org/en/download/
```

## Configuração do Supabase

### 1. Criar Conta e Projeto
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto com:
   - **Nome**: plano-certo-hub
   - **Senha do banco**: (anote esta senha!)
   - **Região**: Escolha a mais próxima

### 2. Obter Credenciais
No dashboard do Supabase:
1. Vá em **Settings → API**
2. Copie:
   - `URL`: https://xxxxx.supabase.co
   - `anon public`: sua_chave_anonima
   - `service_role`: sua_chave_servico

### 3. Executar Migrações do Banco
```sql
-- No Supabase SQL Editor, execute cada arquivo em ordem:

-- 1. Tabelas de Orders
CREATE TABLE IF NOT EXISTS ifood_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) UNIQUE NOT NULL,
  merchant_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_cpf VARCHAR(20),
  delivery_address TEXT,
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  total_value DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2),
  payment_method VARCHAR(50),
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabelas de Events
CREATE TABLE IF NOT EXISTS ifood_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  order_id VARCHAR(255),
  merchant_id VARCHAR(255) NOT NULL,
  payload JSONB,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabelas de Polling
CREATE TABLE IF NOT EXISTS ifood_polling_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(255) NOT NULL,
  events_count INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabelas de Tokens
CREATE TABLE IF NOT EXISTS ifood_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabelas de Shipping
CREATE TABLE IF NOT EXISTS ifood_shipping_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) UNIQUE NOT NULL,
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  driver_cpf VARCHAR(20),
  vehicle_type VARCHAR(50),
  vehicle_plate VARCHAR(20),
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  estimated_delivery TIMESTAMP,
  safe_delivery_score INTEGER,
  tracking_url TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabelas de Reviews
CREATE TABLE IF NOT EXISTS ifood_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id VARCHAR(255) UNIQUE NOT NULL,
  order_id VARCHAR(255),
  merchant_id VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  sentiment VARCHAR(20),
  replied BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ifood_review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id VARCHAR(255) REFERENCES ifood_reviews(review_id),
  reply_text TEXT NOT NULL,
  replied_by VARCHAR(255),
  replied_at TIMESTAMP DEFAULT NOW()
);

-- 7. Índices para performance
CREATE INDEX idx_orders_merchant ON ifood_orders(merchant_id);
CREATE INDEX idx_orders_status ON ifood_orders(status);
CREATE INDEX idx_orders_created ON ifood_orders(created_at DESC);
CREATE INDEX idx_events_merchant ON ifood_events(merchant_id);
CREATE INDEX idx_events_acknowledged ON ifood_events(acknowledged);
CREATE INDEX idx_shipping_order ON ifood_shipping_status(order_id);
CREATE INDEX idx_reviews_merchant ON ifood_reviews(merchant_id);
```

## Instalação do Backend

### 1. Navegar para o diretório
```bash
cd backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Criar arquivo .env
```bash
# Criar arquivo backend/.env
cat > .env << 'EOF'
# Server Config
PORT=8080
NODE_ENV=development

# Supabase Config
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_KEY=sua_chave_servico_aqui

# CORS Config
CORS_ORIGIN=http://localhost:5173

# Session Config
SESSION_SECRET=um_segredo_aleatorio_aqui
EOF
```

### 4. Verificar instalação
```bash
# Testar se está funcionando
npm run dev
# Deve mostrar: "Server running on port 8080"
```

## Instalação do Token Service

### 1. Navegar para o diretório
```bash
cd ../services/ifood-token-service
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Criar arquivo .env
```bash
# Criar arquivo services/ifood-token-service/.env
cat > .env << 'EOF'
# Server Config
PORT=8081
NODE_ENV=development

# Supabase Config
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=sua_chave_servico_aqui

# iFood API Config (Sandbox para testes)
IFOOD_CLIENT_ID=seu_client_id_aqui
IFOOD_CLIENT_SECRET=seu_client_secret_aqui
IFOOD_MERCHANT_ID=seu_merchant_id_aqui
IFOOD_API_URL=https://merchant-api.ifood.com.br
IFOOD_AUTH_URL=https://merchant-api.ifood.com.br/authentication/v1.0

# Polling Config
POLLING_INTERVAL=30000
POLLING_BATCH_SIZE=100

# Cache Config
CACHE_TOKEN_TTL=300000
CACHE_MERCHANT_TTL=600000
EOF
```

### 4. Compilar TypeScript
```bash
# Compilar o código TypeScript
npm run build
```

### 5. Executar migrações
```bash
# Rodar script de migração
node executeMigration.js
```

### 6. Verificar instalação
```bash
npm run dev
# Deve mostrar: "Token Service running on port 8081"
```

## Instalação do Frontend

### 1. Navegar para o diretório
```bash
cd ../../frontend/plano-certo-hub-insights
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Criar arquivo .env
```bash
# Criar arquivo frontend/plano-certo-hub-insights/.env
cat > .env << 'EOF'
# API URLs
VITE_API_URL=http://localhost:8080
VITE_TOKEN_SERVICE_URL=http://localhost:8081

# Supabase Config
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Features Config
VITE_ENABLE_MAPS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REVIEWS=true

# Map Config (opcional)
VITE_MAPBOX_TOKEN=seu_token_mapbox_opcional
EOF
```

### 4. Verificar instalação
```bash
npm run dev
# Deve mostrar: "Local: http://localhost:5173"
```

## Configuração do iFood API

### 1. Obter Credenciais iFood

#### Para Ambiente de Testes (Sandbox)
1. Acesse [Portal do Parceiro iFood](https://portal.ifood.com.br)
2. Registre-se como desenvolvedor
3. Crie uma aplicação de teste
4. Obtenha:
   - `client_id`
   - `client_secret`
   - `merchant_id` (ID do restaurante teste)

#### Para Produção
1. Complete o processo de homologação
2. Solicite credenciais de produção
3. Configure URLs de produção

### 2. Configurar no Sistema
1. Acesse `http://localhost:5173`
2. Faça login com suas credenciais
3. Vá em **Configurações → API iFood**
4. Insira:
   - Client ID
   - Client Secret
   - Merchant ID
5. Selecione ambiente (Sandbox/Production)
6. Clique em **Testar Conexão**
7. Se sucesso, clique em **Salvar**

## Execução do Sistema

### Iniciar Todos os Serviços

#### Opção 1: Manualmente (3 terminais)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Token Service
cd services/ifood-token-service
npm run dev

# Terminal 3 - Frontend
cd frontend/plano-certo-hub-insights
npm run dev
```

#### Opção 2: Com Script (Linux/Mac)
```bash
# Criar script start-all.sh
cat > start-all.sh << 'EOF'
#!/bin/bash
# Iniciar todos os serviços

echo "Starting Backend..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "Starting Token Service..."
cd services/ifood-token-service && npm run dev &
TOKEN_PID=$!

echo "Starting Frontend..."
cd frontend/plano-certo-hub-insights && npm run dev &
FRONTEND_PID=$!

echo "All services started!"
echo "Backend PID: $BACKEND_PID"
echo "Token Service PID: $TOKEN_PID"
echo "Frontend PID: $FRONTEND_PID"

# Aguardar Ctrl+C
wait
EOF

chmod +x start-all.sh
./start-all.sh
```

#### Opção 3: Com PM2 (Recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 8080
      }
    },
    {
      name: 'token-service',
      cwd: './services/ifood-token-service',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 8081
      }
    },
    {
      name: 'frontend',
      cwd: './frontend/plano-certo-hub-insights',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 5173
      }
    }
  ]
}
EOF

# Iniciar todos
pm2 start ecosystem.config.js

# Ver logs
pm2 logs

# Parar todos
pm2 stop all
```

## Verificação e Testes

### 1. Verificar Serviços
```bash
# Backend
curl http://localhost:8080/health
# Deve retornar: {"status":"ok"}

# Token Service
curl http://localhost:8081/health
# Deve retornar: {"status":"healthy"}

# Frontend
curl http://localhost:5173
# Deve retornar HTML
```

### 2. Testar Fluxo Completo

#### Passo 1: Login
1. Acesse `http://localhost:5173`
2. Use credenciais de teste ou crie conta
3. Deve ver o dashboard

#### Passo 2: Configurar iFood
1. Vá em **Configurações → API iFood**
2. Configure credenciais
3. Teste conexão

#### Passo 3: Iniciar Polling
1. Vá em **Pedidos → Gestão**
2. Clique em **Iniciar Polling**
3. Aguarde pedidos aparecerem

#### Passo 4: Testar Pedido (Sandbox)
```bash
# Criar pedido teste via API
curl -X POST http://localhost:8081/api/test/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "seu_merchant_id",
    "customerName": "Cliente Teste",
    "items": [
      {"name": "Pizza", "quantity": 1, "price": 30.00}
    ]
  }'
```

### 3. Verificar Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Token Service logs
tail -f services/ifood-token-service/logs/app.log

# Ver no banco de dados
# No Supabase SQL Editor:
SELECT * FROM ifood_orders ORDER BY created_at DESC LIMIT 10;
SELECT * FROM ifood_events ORDER BY created_at DESC LIMIT 10;
SELECT * FROM ifood_polling_log ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Problemas Comuns e Soluções

#### 1. Porta já em uso
```bash
# Erro: EADDRINUSE: address already in use
# Solução: Matar processo na porta
lsof -i :8080  # Ver qual processo está usando
kill -9 [PID]  # Matar processo
```

#### 2. Erro de CORS
```javascript
// Erro: CORS policy blocked
// Solução: Verificar configuração no backend
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',  // URL do frontend
  credentials: true
}));
```

#### 3. Token expirado
```bash
# Erro: 401 Unauthorized
# Solução: Sistema renova automaticamente
# Ou force renovação:
curl -X POST http://localhost:8081/api/token/refresh
```

#### 4. Banco não conecta
```bash
# Erro: Connection refused
# Solução: Verificar credenciais Supabase
# Testar conexão:
psql "postgresql://postgres:[senha]@[host]:5432/postgres"
```

#### 5. Dependências não instaladas
```bash
# Erro: Module not found
# Solução: Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### 6. TypeScript errors
```bash
# Erro: TS compilation errors
# Solução: Rebuild
cd services/ifood-token-service
npm run build
```

### Comandos Úteis de Debug

```bash
# Ver todos os processos Node
ps aux | grep node

# Ver uso de memória
top -c

# Limpar cache npm
npm cache clean --force

# Resetar banco (CUIDADO!)
# No Supabase:
TRUNCATE TABLE ifood_orders CASCADE;
TRUNCATE TABLE ifood_events CASCADE;

# Ver variáveis de ambiente
printenv | grep SUPABASE
printenv | grep IFOOD

# Testar conexão com iFood
curl -X POST https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=SEU_ID&client_secret=SEU_SECRET&grant_type=client_credentials"
```

## Próximos Passos

Após instalação bem-sucedida:

1. **Configurar Produção**: Veja [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Desenvolvimento**: Veja [DEVELOPMENT.md](./DEVELOPMENT.md)
3. **Documentação da API**: Veja [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. **Módulos**: Veja [MODULES_DOCUMENTATION.md](./MODULES_DOCUMENTATION.md)

## Suporte

Para problemas não cobertos aqui:
1. Verifique os logs detalhados
2. Consulte a documentação do iFood API
3. Abra uma issue no repositório
4. Contate o suporte técnico