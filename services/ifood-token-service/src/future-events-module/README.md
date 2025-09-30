# 🔄 Módulo de Eventos - Para Implementação Futura

## ⚠️ IMPORTANTE
Este módulo foi separado para implementação futura. Os endpoints de polling e eventos foram removidos da aplicação principal conforme solicitado, mas o código está preservado aqui para quando for necessário implementar.

## Objetivo
Implementar o sistema de polling de eventos do iFood para captura em tempo real de:
- Novos pedidos
- Mudanças de status
- Atualizações de delivery
- Eventos de merchant

## Requisitos Principais

### 1. Polling de Eventos
- **Endpoint**: `GET /events:polling`
- **Intervalo**: A cada 30 segundos
- **Header**: `x-polling-merchants` para filtrar por merchant
- **Filtros**: Por tipo e grupo de eventos

### 2. Acknowledgment
- **Endpoint**: `POST /events/acknowledgment`
- **Quando**: Imediatamente após receber eventos (código 200)
- **Objetivo**: Confirmar recebimento para evitar duplicação

## Estrutura Planejada

```
future-events-module/
├── README.md (este arquivo)
├── pollingService.ts       # Motor de polling principal
├── eventHandlers.ts        # Handlers para diferentes tipos de eventos
├── eventTypes.ts           # Definições de tipos de eventos
└── eventsEndpoints.ts      # Endpoints Express para eventos
```

## Headers Necessários
```javascript
{
  'x-polling-merchants': merchantId,  // Filtrar eventos por merchant
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Fluxo de Implementação

1. **Iniciar Polling**
   - Criar ciclo de 30 segundos
   - Enviar request para `/events:polling`
   - Incluir header `x-polling-merchants`

2. **Processar Eventos**
   - Receber array de eventos
   - Validar e deduplicar
   - Processar por tipo

3. **Confirmar Recebimento**
   - Enviar acknowledgment para todos eventos
   - POST para `/events/acknowledgment`
   - Incluir IDs dos eventos processados

## Exemplo de Request de Polling

```javascript
// GET /events:polling
const response = await fetch('https://merchant-api.ifood.com.br/events:polling', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-polling-merchants': merchantId,
    'Content-Type': 'application/json'
  }
});
```

## Exemplo de Acknowledgment

```javascript
// POST /events/acknowledgment
const ackResponse = await fetch('https://merchant-api.ifood.com.br/events/acknowledgment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventIds: ['event1', 'event2', 'event3']
  })
});
```

## Notas de Implementação

- Implementar mecanismo de retry em caso de falha
- Usar deduplicação para evitar processar eventos duplicados
- Manter log de todos eventos para auditoria
- Implementar health check para monitorar status do polling
- Considerar usar workers separados para não bloquear thread principal

## Referências
- Documentação completa em: `/docs/modules/events/README.md`
- Implementação anterior (backup): `server.ts.old`