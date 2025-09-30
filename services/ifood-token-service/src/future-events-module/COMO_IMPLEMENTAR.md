# 📋 Como Implementar o Módulo de Eventos

## Passo a Passo para Ativar o Módulo

### 1. Criar Tabelas no Banco de Dados

Execute o script SQL fornecido:
```bash
psql -U seu_usuario -d seu_banco < DATABASE_SCHEMA.sql
```

### 2. Adicionar Variável de Ambiente

No arquivo `.env`:
```env
ENABLE_EVENTS_MODULE=true
```

### 3. Integrar no Server Principal

No arquivo `server.ts`, adicione no topo:
```typescript
import { setupEventsEndpoints } from './future-events-module/eventsEndpoints';
```

Após os outros endpoints, adicione:
```typescript
// ====== EVENTS MODULE ======
if (process.env.ENABLE_EVENTS_MODULE === 'true') {
  setupEventsEndpoints(app);
  console.log('📢 Events module endpoints enabled');
}
```

### 4. Testar os Endpoints

#### Iniciar Polling
```bash
curl -X POST http://localhost:6000/events/polling/start \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "seu-merchant-id",
    "userId": "seu-user-id"
  }'
```

#### Verificar Status
```bash
curl http://localhost:6000/events/polling/status
```

#### Parar Polling
```bash
curl -X POST http://localhost:6000/events/polling/stop \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "seu-merchant-id",
    "userId": "seu-user-id"
  }'
```

## Endpoints Principais do iFood

### 1. Polling de Eventos
```
GET https://merchant-api.ifood.com.br/events:polling
Headers:
- Authorization: Bearer {token}
- x-polling-merchants: {merchantId}
```

### 2. Acknowledgment
```
POST https://merchant-api.ifood.com.br/events/acknowledgment
Body: {
  "eventIds": ["id1", "id2", "id3"]
}
```

## Configuração Recomendada

### Intervalos
- **Polling**: 30 segundos (requisito do iFood)
- **Retry**: 3 tentativas com backoff exponencial
- **Timeout**: 10 segundos por request

### Filtros Disponíveis
```javascript
{
  filters: {
    eventTypes: ['PLACED', 'CONFIRMED', 'CANCELLED'],
    eventGroups: ['ORDER', 'DELIVERY']
  }
}
```

## Monitoramento

### Métricas Importantes
- Taxa de sucesso de polling
- Eventos por minuto
- Latência de acknowledgment
- Erros por hora

### Health Check
```typescript
// Adicionar ao health check existente
const pollingHealth = eventPollingService.getPollingStatus();
```

## Troubleshooting

### Problema: Eventos Duplicados
**Solução**: Verificar se acknowledgment está sendo enviado corretamente

### Problema: Polling Para Sozinho
**Solução**: Verificar logs de erro e configurar auto-restart

### Problema: Token Expirado
**Solução**: Integrar com tokenScheduler para renovação automática

## Próximos Passos

1. **Implementar Handlers Específicos**
   - Order handler para pedidos
   - Delivery handler para entregas
   - Review handler para avaliações

2. **Adicionar Webhooks** (quando disponível)
   - Mais eficiente que polling
   - Menor latência
   - Menor uso de recursos

3. **Dashboard de Monitoramento**
   - Visualização em tempo real
   - Alertas automáticos
   - Relatórios de performance

## Contato

Para dúvidas sobre a implementação, consultar:
- Documentação do iFood: https://developer.ifood.com.br
- Documentação interna: `/docs/modules/events/README.md`