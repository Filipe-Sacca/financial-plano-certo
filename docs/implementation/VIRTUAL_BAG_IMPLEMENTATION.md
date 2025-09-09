# Virtual Bag Implementation Guide

## Overview
O endpoint `/virtual-bag` é específico para pedidos da categoria **Groceries** (mercado/supermercado) do iFood. 
Este documento contém o código pronto para reativar esta funcionalidade quando necessário.

## Quando usar Virtual Bag?
- ✅ **USE** para pedidos de categoria Groceries/Mercado
- ❌ **NÃO USE** para pedidos de restaurantes tradicionais

## Como reativar o Virtual Bag

### Localização do código
Arquivo: `services/ifood-token-service/src/ifoodPollingService.ts`
Método: `saveOrderFromPlacedEvent` (linha ~765)

### Código para substituir

**Procure por:**
```typescript
// Get complete order data from standard order API
// NOTE: For groceries category, use virtual-bag endpoint: /orders/${orderId}/virtual-bag
let orderData = null;

try {
  console.log(`🔍 [ORDER-SAVE] Fetching order data via standard API: ${orderId}`);
  const orderResponse = await this.optimizedAxios.get(
    `https://merchant-api.ifood.com.br/order/v1.0/orders/${orderId}`,
    // ... resto do código
```

**Substitua por:**
```typescript
// Get complete order data from virtual bag API (for groceries) or standard API
let orderData = null;

try {
  console.log(`🔍 [ORDER-SAVE] Fetching order data via virtual bag: ${orderId}`);
  const virtualBagResponse = await this.optimizedAxios.get(
    `https://merchant-api.ifood.com.br/order/v1.0/orders/${orderId}/virtual-bag`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (virtualBagResponse.status === 200) {
    orderData = virtualBagResponse.data;
    console.log(`✅ [ORDER-SAVE] Virtual bag data retrieved for order: ${orderId}`);
  }
} catch (virtualBagError: any) {
  console.log(`🔄 [ORDER-SAVE] Virtual bag failed, trying standard order endpoint for ${orderId}`);
  
  // Fallback to standard order endpoint
  try {
    const orderResponse = await this.optimizedAxios.get(
      `https://merchant-api.ifood.com.br/order/v1.0/orders/${orderId}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (orderResponse.status === 200) {
      orderData = orderResponse.data;
      console.log(`✅ [ORDER-SAVE] Standard order data retrieved for order: ${orderId}`);
    }
  } catch (orderError: any) {
    console.error(`❌ [ORDER-SAVE] Failed to get order data for ${orderId}:`, orderError.message);
    
    // Save minimal order with event data only
    orderData = {
      id: orderId,
      createdAt: event.createdAt,
      salesChannel: event.salesChannel,
      merchant: { id: event.merchantId }
    };
    console.log(`📝 [ORDER-SAVE] Using minimal event data for order: ${orderId}`);
  }
}
```

## Fluxo com Virtual Bag ativo

1. **Primeiro tenta** → `/orders/{id}/virtual-bag` (específico para Groceries)
2. **Se falhar** → `/orders/{id}` (endpoint padrão)
3. **Se ambos falharem** → Usa dados mínimos do evento

## Diferenças entre os endpoints

### Virtual Bag (`/virtual-bag`)
- Contém detalhes específicos de produtos de mercado
- Informações de peso, medidas, substituições
- Usado para categoria Groceries

### Standard (`/orders/{id}`)
- Endpoint padrão para todos os pedidos
- Funciona para todas as categorias
- Estrutura de dados mais simples

## Comando para ativar rapidamente

```bash
# Para o próximo Claude Code, use este comando:
"Ative o virtual-bag endpoint conforme documentado em docs/VIRTUAL_BAG_IMPLEMENTATION.md"
```

## Notas importantes
- O virtual-bag adiciona ~100ms de latência quando falha (tenta primeiro e depois fallback)
- Para restaurantes tradicionais, o virtual-bag sempre retornará 404
- Considere detectar a categoria do merchant antes de decidir qual endpoint usar