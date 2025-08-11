# 🚀 Integração iFood - Sistema de Token de Acesso

Este documento detalha a implementação completa do sistema de geração e gestão de tokens de acesso para a API do iFood, baseado no fluxo N8N fornecido.

## 📋 Visão Geral

O sistema implementa o fluxo OAuth2 Client Credentials do iFood com as seguintes funcionalidades:

- ✅ **Serviço Python** para geração de tokens
- ✅ **API FastAPI** para integração local
- ✅ **Interface React** integrada ao dashboard
- ✅ **Fallback para webhook N8N** existente
- ✅ **Armazenamento seguro** no Supabase

## 🛠️ Arquitetura

```
Frontend React ──┐
                 ├── Python Service (localhost:8000) ──┐
                 └── N8N Webhook (fallback)            ├── iFood API
                                                       └── Supabase
```

### Componentes Criados

1. **`python_services/ifood_token_service.py`** - Serviço principal
2. **`python_services/api_server.py`** - API FastAPI
3. **`IfoodApiConfig.tsx`** - Interface React (modificada)

## 🔧 Configuração

### 1. Configurar Ambiente Python

```bash
cd python_services

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
```

### 2. Configurar `.env`

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# iFood API Configuration (opcional para testes)
IFOOD_CLIENT_ID=your-ifood-client-id
IFOOD_CLIENT_SECRET=your-ifood-client-secret
```

### 3. Executar Serviço Python

```bash
# Modo desenvolvimento
python api_server.py

# Ou usando uvicorn diretamente
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

## 📚 Como Usar

### 1. Via Interface React

1. **Acesse** o dashboard da aplicação
2. **Navegue** para "Configuração API iFood"
3. **Insira** suas credenciais (Client ID + Client Secret)
4. **Clique** em "Conectar ao iFood"

### 2. Via API Direta

```bash
# POST /token
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "seu-client-id",
    "clientSecret": "seu-client-secret",
    "user_id": "uuid-do-usuario"
  }'
```

### 3. Health Check

```bash
# GET /health  
curl http://localhost:8000/health
```

## 🔄 Fluxo de Funcionamento

### Fluxo Principal (Python Service)

1. **Frontend** envia credenciais para `localhost:8000/token`
2. **Serviço Python** verifica token existente no Supabase
3. Se não existe ou expirou:
   - Chama API iFood (`/authentication/v1.0/oauth/token`)
   - Armazena novo token no Supabase
4. **Retorna** dados do token para o frontend

### Fluxo Fallback (N8N Webhook)

Se o serviço Python não estiver disponível, a interface automaticamente usa o webhook N8N existente.

## 📊 Estrutura do Token no Supabase

Tabela: `ifood_tokens`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `client_id` | string | Client ID do iFood |
| `client_secret` | string | Client Secret do iFood |
| `access_token` | string | Token de acesso gerado |
| `expires_at` | timestamp | Data de expiração |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Última atualização |
| `user_id` | uuid | ID do usuário |

## 🧪 Testes

### Teste Básico Local

```python
# Executar teste no serviço Python
cd python_services
python ifood_token_service.py
```

### Teste via API

```bash
# Testar geração de token
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "f133bf28-ff34-47c3-827d-dd2b662f0363",
    "clientSecret": "gh1x4aatcrge25wtv6j6qx9b1lqktt3vupjxijp10iodlojmj1vytvibqzgai5z0zjd3t5drhxij5ifwf1nlw09z06mt92rx149",
    "user_id": "4bd7433f-bc74-471f-ac0d-7d631bd5038c"
  }'
```

## 🔒 Segurança

- ✅ **Client Secrets** armazenados criptografados
- ✅ **Validação** de expiração de tokens
- ✅ **CORS** configurado para o frontend
- ✅ **Rate limiting** via iFood (10 req/s)
- ✅ **Logs** de auditoria

## 🐛 Troubleshooting

### Erro: "Session not found or expired"

- Verifique as variáveis de ambiente no `.env`
- Confirme que o Supabase está acessível

### Erro: "iFood API error: 400"

- Verifique Client ID e Client Secret
- Confirme que as credenciais são válidas no ambiente correto (sandbox/prod)

### Erro: "Connection refused localhost:8000"

- Certifique-se que o serviço Python está rodando
- Verifique se a porta 8000 não está ocupada

### Frontend não conecta

- Abra o console do browser para logs detalhados
- Verifique se o fallback N8N está funcionando

## 📈 Próximos Passos

Com o sistema de tokens funcionando, os próximos desenvolvimentos incluem:

1. **Financial API V3** - Implementar coleta de dados financeiros
2. **Merchant API** - Expandir dados de restaurantes  
3. **Real-time Webhooks** - Implementar notificações em tempo real
4. **Catalog Management** - Sistema completo de gestão de cardápio

## 🔗 Links Úteis

- [iFood Developer Portal](https://developer.ifood.com.br/)
- [Documentação OAuth2](https://developer.ifood.com.br/en-US/docs/guides/authentication/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Python Client](https://github.com/supabase/supabase-py)

---

**📝 Nota:** Este sistema replica exatamente o fluxo N8N existente, mas oferece maior flexibilidade, melhor performance e facilita futuras expansões da integração iFood.