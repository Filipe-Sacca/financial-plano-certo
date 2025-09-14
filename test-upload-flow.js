const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuração do teste
const config = {
  baseUrl: 'http://localhost:8085',
  userId: 'f133bf28-ff34-47c3-827d-dd2b662f0363', // ID do usuário de teste
  merchantId: '5c8c1b4c-3b6b-4f8a-8d8b-9c3d2e1f0a9b' // ID do merchant de teste
};

// Função para converter imagem para base64
function imageToBase64(imagePath) {
  try {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  } catch (error) {
    console.error('❌ Erro ao ler imagem:', error.message);
    return null;
  }
}

// Criar uma imagem pequena de teste (pixel vermelho 1x1 PNG)
function createTestImage() {
  // PNG de 1x1 pixel vermelho em base64
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
}

async function testImageUploadFlow() {
  try {
    console.log('🧪 === TESTE DE FLUXO DE UPLOAD DE IMAGEM ===');

    // 1. Testar upload de imagem apenas
    console.log('\n📸 [STEP 1] Testando upload de imagem...');
    const testImage = createTestImage();

    const uploadResponse = await axios.post(
      `${config.baseUrl}/merchants/${config.merchantId}/image/upload`,
      {
        user_id: config.userId,
        image: `data:image/png;base64,${testImage}`
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('✅ Upload de imagem bem-sucedido:');
    console.log('📄 Resposta:', JSON.stringify(uploadResponse.data, null, 2));

    // 2. Testar criação de produto com imagem
    console.log('\n🍔 [STEP 2] Testando criação de produto com imagem...');

    const productData = {
      user_id: config.userId,
      image: `data:image/png;base64,${testImage}`, // Imagem será enviada primeiro
      item: {
        status: 'AVAILABLE',
        price: {
          value: 1500 // R$ 15,00
        },
        categoryId: 'cat_1726261168063_w7yt8qhg5' // ID de uma categoria existente
      },
      products: [
        {
          name: 'Produto Teste com Imagem',
          description: 'Produto criado para testar o fluxo de upload de imagem'
        }
      ]
    };

    const productResponse = await axios.put(
      `${config.baseUrl}/merchants/${config.merchantId}/items`,
      productData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('✅ Produto criado com imagem:');
    console.log('📄 Resposta:', JSON.stringify(productResponse.data, null, 2));

    console.log('\n🎉 === TESTE COMPLETO - TODOS OS FLUXOS FUNCIONANDO! ===');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);

    if (error.response?.data?.error?.details) {
      console.error('📋 Detalhes do erro:', error.response.data.error.details);
    }
  }
}

// Executar o teste
testImageUploadFlow();