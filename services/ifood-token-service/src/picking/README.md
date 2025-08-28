# 📋 iFood Picking Module

**Status:** ✅ **IMPLEMENTAÇÃO COMPLETA**  
**Homologação:** 🎉 **PRONTO PARA HOMOLOGAÇÃO**  
**Versão:** 1.0.0

## 🎯 Visão Geral

O Módulo de Picking é responsável pela **gestão de separação de pedidos** na plataforma iFood. É um dos módulos **obrigatórios** para homologação oficial e permite:

- ✅ Iniciar e finalizar processos de separação de pedidos
- ✅ Modificar itens durante a separação (adicionar, editar, remover)
- ✅ Ajustar quantidades e pesos de produtos
- ✅ Gerenciar situações de falta de estoque
- ✅ Garantir que o pedido final reflita exatamente o que foi separado

## 🔗 Endpoints Implementados

### 🚨 **Endpoints Obrigatórios (5/5 ✅)**

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `POST` | `/picking/startSeparation` | Iniciar separação de pedido | ✅ |
| `POST` | `/picking/orders/{orderId}/items` | Adicionar item ao pedido | ✅ |
| `PATCH` | `/picking/orders/{orderId}/items/{uniqueId}` | Atualizar item do pedido | ✅ |
| `DELETE` | `/picking/orders/{orderId}/items/{uniqueId}` | Remover item do pedido | ✅ |
| `POST` | `/picking/endSeparation` | Finalizar separação | ✅ |

### 📊 **Endpoints Auxiliares (4/4 ✅)**

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| `GET` | `/picking/health` | Health check do módulo | ✅ |
| `GET` | `/picking/status/{orderId}` | Status da separação | ✅ |
| `GET` | `/picking/sessions/active` | Sessões ativas | ✅ |
| `POST` | `/picking/cancel/{orderId}` | Cancelar separação | ✅ |

**Total:** 9/9 endpoints (100%)

## 🏗️ Arquitetura

```
src/picking/
├── types/                          # Interfaces TypeScript
│   ├── PickingTypes.ts             # Tipos principais
│   ├── PickingRequestTypes.ts      # Tipos de requisições
│   ├── PickingResponseTypes.ts     # Tipos de respostas
│   └── index.ts                    # Barrel export
├── services/                       # Lógica de negócio
│   ├── PickingService.ts           # Serviço principal
│   └── PickingValidationService.ts # Validações
├── utils/                          # Utilitários
│   ├── PickingConstants.ts         # Constantes
│   └── PickingHelpers.ts           # Funções auxiliares
└── README.md                       # Esta documentação
```

## 🔧 Uso dos Serviços

### PickingService (Principal)

```typescript
import { PickingService } from './services/PickingService';

const pickingService = new PickingService(token, merchantId);

// 1. Iniciar separação
const startResult = await pickingService.startSeparation(orderId);

// 2. Adicionar item
const addResult = await pickingService.addItemToOrder(orderId, {
  quantity: 2,
  product_id: "product-123",
  replacedUniqueId: "optional-uuid"
});

// 3. Atualizar item
const updateResult = await pickingService.updateOrderItem(orderId, uniqueId, {
  quantity: 1
});

// 4. Remover item
const removeResult = await pickingService.removeOrderItem(orderId, uniqueId);

// 5. Finalizar separação
const endResult = await pickingService.endSeparation(orderId);
```

### PickingValidationService

```typescript
import { PickingValidationService } from './services/PickingValidationService';

const validationService = new PickingValidationService(merchantId);

// Validar dados antes de adicionar item
const validation = await validationService.validateAddItem({
  quantity: 2,
  product_id: "product-123"
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}
```

## 📡 Exemplos de Requisições

### 1. Iniciar Separação

```bash
POST /picking/startSeparation
Content-Type: application/json

{
  "userId": "user-123",
  "orderId": "order-456",
  "notes": "Iniciando separação do pedido"
}
```

### 2. Adicionar Item

```bash
POST /picking/orders/order-456/items
Content-Type: application/json

{
  "userId": "user-123",
  "quantity": 2,
  "product_id": "product-789",
  "replacedUniqueId": "uuid-optional",
  "substitution_reason": "Produto original indisponível"
}
```

### 3. Atualizar Item

```bash
PATCH /picking/orders/order-456/items/item-uuid
Content-Type: application/json

{
  "userId": "user-123",
  "quantity": 1,
  "notes": "Ajuste de quantidade por falta de estoque"
}
```

### 4. Remover Item

```bash
DELETE /picking/orders/order-456/items/item-uuid?userId=user-123&reason=Produto danificado
```

### 5. Finalizar Separação

```bash
POST /picking/endSeparation
Content-Type: application/json

{
  "userId": "user-123",
  "orderId": "order-456",
  "finalValidation": true,
  "notes": "Separação finalizada com sucesso"
}
```

## 🔍 Casos de Uso Reais

### 🛒 Cenário 1: Falta de Estoque
```
1. Cliente pediu 3 unidades, só tem 2 em estoque
2. POST /picking/startSeparation
3. PATCH /orders/123/items/item-uuid { "quantity": 2 }
4. POST /picking/endSeparation
```

### 🔄 Cenário 2: Substituição de Produto
```
1. Produto A não disponível, substituir por produto B
2. POST /picking/startSeparation  
3. POST /orders/123/items { "product_id": "B", "replacedUniqueId": "A-uuid" }
4. POST /picking/endSeparation
```

### ⚖️ Cenário 3: Ajuste de Peso
```
1. Cliente pediu 500g, produto pesou 480g
2. POST /picking/startSeparation
3. POST /orders/123/items { 
     "quantity": 480, 
     "product_id": "same-product",
     "replacedUniqueId": "original-item-uuid",
     "actual_weight": 480,
     "original_weight": 500
   }
4. POST /picking/endSeparation
```

## ✅ Validações Implementadas

### Validações de Entrada
- ✅ `orderId` obrigatório e válido
- ✅ `product_id` obrigatório e deve existir no catálogo
- ✅ `quantity` deve ser número inteiro positivo
- ✅ `uniqueId` deve ser UUID válido
- ✅ `replacedUniqueId` deve ser UUID válido (quando fornecido)

### Validações de Regras de Negócio
- ✅ Separação deve ser iniciada antes de modificar itens
- ✅ Não é possível modificar itens após finalização
- ✅ Verificação de sequência de operações
- ✅ Integração com catálogo para validar produtos

### Validações de Segurança
- ✅ Token de autenticação obrigatório
- ✅ Merchant ID válido
- ✅ Rate limiting implementado
- ✅ Sanitização de dados de entrada

## 🚨 Tratamento de Erros

### Códigos de Erro Principais
- `INVALID_ORDER_ID` - Order ID inválido
- `SEPARATION_NOT_STARTED` - Tentativa de modificar sem iniciar separação
- `SEPARATION_ALREADY_STARTED` - Separação já em andamento
- `PRODUCT_NOT_FOUND` - Produto não existe no catálogo
- `INVALID_QUANTITY` - Quantidade inválida
- `ITEM_NOT_FOUND` - Item não encontrado
- `VALIDATION_FAILED` - Falha na validação de dados
- `NETWORK_ERROR` - Erro de rede (retry automático)

### Retry Automático
- ✅ Exponential backoff para erros de rede
- ✅ Rate limit handling
- ✅ Timeout management
- ✅ Circuit breaker pattern

## 📊 Métricas e Monitoramento

### Logs Estruturados
```
🚀 [PICKING] Starting separation - User: user-123, Order: order-456
🔹 [PICKING] Adding item - User: user-123, Order: order-456, Product: product-789
✅ [PICKING] Item added successfully - Order: order-456, Product: product-789
🏁 [PICKING] Separation ended successfully - Order: order-456
```

### Health Check
```bash
GET /picking/health

{
  "success": true,
  "data": {
    "status": "online",
    "module": "picking",
    "version": "1.0.0",
    "endpoints": { ... },
    "implementation": {
      "totalEndpoints": 9,
      "criticalEndpoints": 5,
      "status": "COMPLETE",
      "homologationReady": true
    }
  }
}
```

## 🧪 Testes

### Cobertura
- ✅ Testes unitários para todos os serviços
- ✅ Testes de integração com API do iFood
- ✅ Testes de validação de entrada
- ✅ Testes de casos extremos
- ✅ Testes de sequência de operações

### Execução
```bash
npm test -- picking
```

## 🔐 Segurança

### Headers Obrigatórios
```http
Authorization: Bearer {token}
Content-Type: application/json
x-merchant-id: {merchantId}
x-request-id: {requestId}
```

### Rate Limiting
- Limite: 100 requisições por minuto por usuário
- Retry automático com exponential backoff
- Circuit breaker para falhas consecutivas

## 🚀 Homologação iFood

### Status Atual
- ✅ **Todos os 5 endpoints obrigatórios implementados**
- ✅ **Validações completas**
- ✅ **Tratamento de erros robusto**
- ✅ **Logs e monitoramento**
- ✅ **Testes abrangentes**

### Checklist Homologação
- [x] 5.1 - POST `/startSeparation`
- [x] 5.2 - POST `/orders/{id}/items`
- [x] 5.3 - PATCH `/orders/{id}/items/{uniqueId}`
- [x] 5.4 - DELETE `/orders/{id}/items/{uniqueId}`
- [x] 5.5 - POST `/endSeparation`

### 🎉 **RESULTADO: MÓDULO PRONTO PARA HOMOLOGAÇÃO!**

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Consultar health check: `GET /picking/health`
3. Verificar documentação da API iFood
4. Contatar equipe de desenvolvimento

---

**Desenvolvido com ❤️ para integração iFood**  
**Data de conclusão:** 27 de agosto de 2025  
**Próximo passo:** Homologação oficial com iFood 🚀