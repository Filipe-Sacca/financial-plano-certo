# Correções para Erros de Token de Acesso

## Problemas Corrigidos ✅

### 1. **ERR_CONNECTION_REFUSED** (localhost:9001)
- **Problema**: Frontend tentava conectar na porta 9001, mas o serviço roda na porta 8081
- **Solução**: Atualizados todos os endpoints para `http://localhost:8081`

### 2. **Fallback para N8N removido**
- **Problema**: Sistema tentava usar webhook N8N quando serviço local falhava
- **Solução**: 
  - Removidas todas as referências ao N8N
  - Sistema agora usa apenas o serviço local
  - Endpoints N8N removidos de todos os arquivos

### 3. **CORS Policy Issues**
- **Problema**: Erros CORS com webhook.n8n.html.planocertodelivery.com
- **Solução**: Sistema não faz mais chamadas para N8N, eliminando problemas CORS

## Arquivos Modificados 📝

### Frontend
- `frontend/plano-certo-hub-insights/src/components/modules/IfoodApiConfig.tsx`
- `frontend/plano-certo-hub-insights/src/services/ifoodMerchantsService.ts`
- `frontend/plano-certo-hub-insights/src/utils/ifoodMerchantsService.ts` (reescrito)

### Backend
- Nenhuma alteração necessária no backend Node.js

## Como Testar 🧪

### 1. Inicie os serviços na ordem correta:
```bash
# Opção 1: Use o script automático
start-services.bat

# Opção 2: Manual
# Terminal 1: iFood Token Service
cd services/ifood-token-service
npm run dev

# Terminal 2: Frontend (aguarde o serviço iniciar)
cd frontend/plano-certo-hub-insights
npm run dev
```

### 2. Acesse o sistema:
- Frontend: http://localhost:5173
- iFood Token Service: http://localhost:8081

### 3. Teste o fluxo de token:
1. Vá para "Configuração API iFood"
2. Insira suas credenciais do iFood
3. Clique em "Conectar ao iFood"
4. Verifique se não há mais erros de conexão

## Endpoints Atualizados 🔗

### Antes (❌)
- Token: `http://localhost:9001/token` → **ERR_CONNECTION_REFUSED**
- Merchants: `https://webhook.n8n.hml.planocertodelivery.com/webhook/merchant` → **CORS Error**

### Depois (✅)
- Token: `http://localhost:8081/token`
- Merchants: `http://localhost:8081/merchant`

## Configuração CORS ✅

O serviço local já está configurado para aceitar requisições do frontend:
```javascript
origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000', 'http://localhost:3001']
```

## Verificação de Funcionamento 🔍

Para verificar se tudo está funcionando:

1. **Serviço rodando**: Acesse http://localhost:8081/health
2. **Frontend conectando**: Veja o console do navegador, não deve haver erros de CORS
3. **Token sendo gerado**: Interface deve mostrar "✅ Token gerado com sucesso!"

## Logs para Debug 📊

Se ainda houver problemas, verifique:

1. **Console do navegador**: Erros JavaScript
2. **Terminal do serviço**: Logs das requisições
3. **Network tab**: Status das requisições HTTP

## Próximos Passos 🚀

Agora o sistema deve funcionar completamente local, sem dependências externas do N8N.