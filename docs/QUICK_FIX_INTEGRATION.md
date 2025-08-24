# 🚀 Quick Fix - Integração da Nova Arquitetura de Catálogo

## 🔥 Problema Atual
O erro `FullItemDto is not valid` ocorre porque:
- UUIDs não válidos sendo gerados
- Validação insuficiente de dados
- Payload não seguindo exatamente a spec iFood

## ✅ Solução Imediata

### 1. Corrigir o Endpoint Atual

Substitua o conteúdo do método `createOrUpdateItem` no arquivo `ifoodProductService.ts`:

```typescript
/**
 * ✅ VERSÃO CORRIGIDA - Criar ou atualizar item
 * PUT /catalog/v2.0/merchants/{merchantId}/items
 */
async createOrUpdateItem(userId: string, merchantId: string, itemData: any): Promise<ServiceResponse> {
  try {
    console.log('🍔 [CREATE/UPDATE ITEM] Starting for merchant:', merchantId);
    console.log('📝 [CREATE/UPDATE ITEM] Item data:', JSON.stringify(itemData, null, 2));

    // 1. Buscar token
    const { data: tokenData, error: tokenError } = await this.supabase
      .from('ifood_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData?.access_token) {
      return { success: false, error: 'Token não encontrado' };
    }

    // 2. Validar dados obrigatórios
    if (!itemData.item?.categoryId) {
      return { success: false, error: 'CategoryId é obrigatório' };
    }

    if (!itemData.item?.price?.value || itemData.item.price.value <= 0) {
      return { success: false, error: 'Preço deve ser maior que zero' };
    }

    if (!itemData.products || itemData.products.length === 0) {
      return { success: false, error: 'Pelo menos um produto é obrigatório' };
    }

    if (!itemData.products[0]?.name || itemData.products[0].name.trim().length === 0) {
      return { success: false, error: 'Nome do produto é obrigatório' };
    }

    // 3. Gerar UUID válido
    const productUuid = randomUUID();
    console.log('🔑 [UUID] Generated product UUID:', productUuid);

    // 4. Montar payload seguindo EXATAMENTE a especificação iFood
    const ifoodPayload: any = {
      item: {
        productId: productUuid,
        status: itemData.item.status || 'AVAILABLE',
        price: {
          value: itemData.item.price.value
        },
        categoryId: itemData.item.categoryId
      },
      products: [
        {
          id: productUuid,
          name: itemData.products[0].name.trim()
        }
      ]
    };

    // 5. Adicionar campos opcionais apenas se fornecidos
    if (itemData.item.price.originalValue && itemData.item.price.originalValue > 0) {
      ifoodPayload.item.price.originalValue = itemData.item.price.originalValue;
    }
    
    if (itemData.products[0].description && itemData.products[0].description.trim().length > 0) {
      ifoodPayload.products[0].description = itemData.products[0].description.trim();
    }

    if (itemData.item.externalCode && itemData.item.externalCode.trim().length > 0) {
      ifoodPayload.item.externalCode = itemData.item.externalCode.trim();
    }

    console.log('📤 [SEND TO IFOOD] Final payload:', JSON.stringify(ifoodPayload, null, 2));

    // 6. Enviar para iFood API
    const url = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/items`;
    
    const response = await axios.put(url, ifoodPayload, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ [SUCCESS] Item created/updated successfully');
    console.log('📥 [IFOOD RESPONSE]:', response.data);

    // 7. Salvar no banco local se sucesso
    if (response.data) {
      try {
        await this.supabase
          .from('products')
          .upsert({
            item_id: response.data.id || productUuid,
            product_id: productUuid,
            merchant_id: merchantId,
            name: itemData.products[0].name.trim(),
            description: itemData.products[0].description || '',
            price: itemData.item.price.value,
            original_price: itemData.item.price.originalValue,
            is_active: itemData.item.status === 'AVAILABLE',
            client_id: userId,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'item_id,merchant_id'
          });
        console.log('💾 [LOCAL SAVE] Item saved to local database');
      } catch (dbError) {
        console.warn('⚠️ [LOCAL SAVE] Warning - failed to save locally:', dbError);
      }
    }

    return {
      success: true,
      data: response.data
    };

  } catch (error: any) {
    console.error('❌ [ERROR] Failed to create/update item:', error);
    
    if (error.response?.data) {
      console.error('❌ [ERROR DETAILS] iFood API response:', JSON.stringify(error.response.data, null, 2));
    }

    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Erro interno',
      details: error.response?.data
    };
  }
}
```

### 2. Adicionar Importação do UUID

No topo do arquivo `ifoodProductService.ts`, certifique-se de que tem:

```typescript
import { randomUUID } from 'crypto';
```

### 3. Reiniciar o Servidor

Após fazer as alterações:

```bash
# Ctrl+C para parar o servidor
npm start
```

## 🎯 O Que Foi Corrigido

### ✅ Validação Robusta
- Verificação de todos os campos obrigatórios
- Validação de tipos e valores
- Mensagens de erro claras

### ✅ UUID Válido
- Usa `randomUUID()` do Node.js nativo
- Mesmo UUID para `item.productId` e `products[0].id`
- Formato garantidamente válido

### ✅ Payload Correto
- Segue exatamente a especificação iFood
- Campos opcionais apenas se fornecidos
- Trim em strings para evitar espaços

### ✅ Error Handling
- Logs detalhados para debug
- Captura de erros da API iFood
- Fallback gracioso

## 🚀 Migração para Nova Arquitetura

Após esta correção funcionar, você pode migrar gradualmente para a nova arquitetura completa:

### Fase 1: Testar Correção Atual ✅
- Verificar se o erro foi resolvido
- Testar criação de itens

### Fase 2: Integrar Nova Arquitetura 🔄
```typescript
import { IFoodCatalogService } from './catalog/ifoodCatalogService';

// Substituir gradualmente os endpoints existentes
const catalogService = new IFoodCatalogService(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### Fase 3: Endpoints Completos 🎯
- Upload de imagens
- Gestão de preços
- Validação de compliance
- Relatórios de homologação

## 💡 Teste Rápido

Após aplicar a correção, teste com:

```json
{
  "user_id": "seu-user-id",
  "item": {
    "categoryId": "categoria-uuid-valida",
    "status": "AVAILABLE",
    "price": {
      "value": 19.90,
      "originalValue": 25.00
    }
  },
  "products": [
    {
      "name": "Pizza Teste",
      "description": "Descrição da pizza teste"
    }
  ]
}
```

## 📊 Resultado Esperado

Com esta correção:
- ✅ **Erro `FullItemDto is not valid`** será resolvido
- ✅ **UUIDs válidos** serão gerados
- ✅ **Payload correto** será enviado para iFood
- ✅ **Logs detalhados** para debugging

Esta é uma **solução imediata** para o problema atual, enquanto a **arquitetura completa** que implementei oferece uma solução definitiva e robusta para todos os endpoints de catálogo.