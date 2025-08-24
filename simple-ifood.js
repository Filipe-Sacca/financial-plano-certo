// Versão SUPER SIMPLES da função createOrUpdateItem

async function createOrUpdateItem(userId, merchantId, itemData) {
  try {
    console.log('🍔 [SIMPLE] Dados recebidos:', itemData);

    // 1. Buscar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('ifood_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData?.access_token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const token = tokenData.access_token;

    // 2. Montar EXATAMENTE como a documentação do iFood
    const ifoodPayload = [
      {
        item: {
          status: itemData.item.status || 'AVAILABLE',
          price: {
            value: itemData.item.price.value
          },
          categoryId: itemData.item.categoryId
        },
        products: [
          {
            name: itemData.products[0].name
          }
        ]
      }
    ];

    // Adicionar opcionais APENAS se existirem
    if (itemData.item.price.originalValue) {
      ifoodPayload[0].item.price.originalValue = itemData.item.price.originalValue;
    }
    
    if (itemData.products[0].description) {
      ifoodPayload[0].products[0].description = itemData.products[0].description;
    }

    if (itemData.item.externalCode) {
      ifoodPayload[0].item.externalCode = itemData.item.externalCode;
    }

    console.log('📤 [SIMPLE] Enviando:', JSON.stringify(ifoodPayload, null, 2));

    // 3. Enviar para iFood
    const response = await axios.put(
      `https://merchant-api.ifood.com.br/catalog/v2.0/merchants/${merchantId}/items`,
      ifoodPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('✅ [SIMPLE] Resposta iFood:', response.data);

    // 4. Salvar no banco
    if (response.data) {
      await supabase
        .from('products')
        .upsert({
          item_id: response.data.id,
          merchant_id: merchantId,
          name: itemData.products[0].name,
          description: itemData.products[0].description,
          price: itemData.item.price.value,
          is_active: itemData.item.status === 'AVAILABLE',
          client_id: userId,
          updated_at: new Date().toISOString()
        });
    }

    return { success: true, data: response.data };

  } catch (error) {
    console.error('❌ [SIMPLE] Erro:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}