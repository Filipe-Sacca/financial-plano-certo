# 🏪 iFood Merchant Service

## 📋 Descrição

Serviço completo para sincronização de lojas (merchants) do iFood com banco de dados Supabase. Converte o fluxo N8N `[MERCHANT]` para código Python e Node.js/TypeScript.

## 🎯 Funcionalidades

- ✅ Busca automática de lojas na API do iFood
- ✅ Verificação de lojas existentes no banco
- ✅ Inserção de novas lojas no Supabase
- ✅ Relatório detalhado de sincronização
- ✅ Suporte a múltiplos usuários/clientes

## 🏗️ Arquitetura

### Fluxo Original (N8N)
1. Webhook recebe `user_id` e opcionalmente `access_token`
2. Busca token no Supabase (tabela `ifood_tokens`)
3. Chama API do iFood para obter lista de merchants
4. Filtra dados importantes
5. Verifica se merchant já existe
6. Se não existe, insere na tabela `ifood_merchants`
7. Responde com resultado

### Implementação em Código
- **Python**: `python_services/ifood_merchant_service.py`
- **Node.js/TypeScript**: `ifood-token-service/src/ifoodMerchantService.ts`
- **Endpoints REST**: Integrado ao servidor existente

## 🚀 Como Usar

### 1. Serviço Node.js (Porta 9002)

#### Iniciar o serviço:
```bash
cd ifood-token-service
npm install
npm run dev
```

#### Endpoints disponíveis:

##### Health Check
```bash
GET http://localhost:9002/health
```

##### Sincronizar Merchants
```bash
POST http://localhost:9002/merchant
Content-Type: application/json

{
  "user_id": "c1488646-aca8-4220-aacc-00e7ae3d6490",
  "access_token": "eyJraWQ..." // Opcional - se não fornecido, busca do banco
}
```

##### Verificar se Merchant Existe
```bash
GET http://localhost:9002/merchant/check/{merchant_id}
```

### 2. Serviço Python (Porta 9003)

#### Iniciar o serviço:
```bash
cd python_services
pip install -r requirements.txt
python ifood_merchant_service.py
```

#### Endpoints (mesmos do Node.js):
- `GET /health` - Health check
- `POST /merchant` - Sincronizar merchants
- `GET /merchant/check/<merchant_id>` - Verificar merchant

## 📊 Estrutura do Banco de Dados

### Tabela: `ifood_merchants`
```sql
CREATE TABLE ifood_merchants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  corporate_name VARCHAR(255),
  user_id UUID REFERENCES auth.users(id),
  client_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima

# Servidor
PORT=9002
MERCHANT_SERVICE_PORT=9003  # Para Python

# iFood API
IFOOD_MERCHANT_URL=https://merchant-api.ifood.com.br/merchant/v1.0/merchants
```

## 📝 Exemplo de Resposta

### Sucesso:
```json
{
  "success": true,
  "total_merchants": 3,
  "new_merchants": ["merchant-id-1", "merchant-id-2"],
  "existing_merchants": ["merchant-id-3"],
  "errors": [],
  "message": "Processed 3 merchants: 2 new, 1 existing"
}
```

### Erro:
```json
{
  "success": false,
  "error": "No valid token found for user"
}
```

## 🧪 Testando o Serviço

### 1. Teste com cURL:
```bash
# Health Check
curl http://localhost:9002/health

# Sincronizar Merchants (com token)
curl -X POST http://localhost:9002/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "seu-user-id",
    "access_token": "seu-token-ifood"
  }'

# Sincronizar Merchants (sem token - busca do banco)
curl -X POST http://localhost:9002/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "seu-user-id"
  }'

# Verificar Merchant
curl http://localhost:9002/merchant/check/577cb3b1-5845-4fbc-a219-8cd3939cb9ea
```

### 2. Teste na Aplicação React:

O serviço já está integrado com a aplicação React. Para testar:

1. Acesse http://localhost:8081/
2. Faça login
3. Vá para o módulo de Configuração da API do iFood
4. Clique em "Sincronizar Lojas"

## 🔄 Fluxo de Dados

```
Usuario/App → POST /merchant → Serviço
                                  ↓
                         Busca token no Supabase
                                  ↓
                         Chama API iFood /merchants
                                  ↓
                         Para cada merchant:
                           ├→ Verifica se existe
                           └→ Se não, insere no banco
                                  ↓
                         Retorna relatório
```

## 🛠️ Troubleshooting

### Erro: "No valid token found"
- Verifique se o usuário tem token válido na tabela `ifood_tokens`
- Execute primeiro o endpoint `/token` para gerar um token

### Erro: "iFood API error: 401"
- Token expirado - gere um novo token
- Credenciais inválidas

### Erro: "Database error"
- Verifique as credenciais do Supabase
- Confirme que a tabela `ifood_merchants` existe
- Verifique permissões RLS

## 📚 Dependências

### Node.js:
- express
- cors
- @supabase/supabase-js
- axios
- dotenv
- typescript

### Python:
- requests
- flask
- flask-cors
- python-dotenv

## 🔐 Segurança

- Tokens armazenados de forma segura no Supabase
- Validação de entrada em todos os endpoints
- CORS configurado para domínios específicos
- Variáveis sensíveis em arquivo .env

## 📈 Próximos Passos

- [ ] Adicionar cache para merchants
- [ ] Implementar webhook para atualização automática
- [ ] Adicionar métricas de performance
- [ ] Criar testes automatizados
- [ ] Adicionar paginação para muitos merchants

## 💡 Observações

- O serviço reutiliza tokens existentes quando possível
- Merchants já existentes não são duplicados
- Status padrão é "AVAILABLE" para novos merchants
- Suporta múltiplos usuários/clientes simultaneamente

---

**Desenvolvido com ❤️ convertendo fluxos N8N para código produtivo**