const axios = require('axios');

async function testProductCreation() {
  console.log('🧪 Testing product creation with minimal fields...\n');
  
  const baseUrl = 'http://localhost:8083';
  const merchantId = '577cb3b1-5845-4fbc-a219-8cd3939cb9ea';
  const userId = 'f133bf28-ff34-47c3-827d-dd2b662f0363';
  
  // Minimal required fields according to iFood API
  const minimalProduct = {
    user_id: userId,
    item: {
      status: 'AVAILABLE',
      categoryId: 'a5486a2d-e4da-4d3f-96cf-49877930ffb3', // Pizzas Salgadas
      price: {
        value: 50.00
      }
    },
    products: [
      {
        name: 'Pizza Teste Mínima'
      }
    ]
  };
  
  console.log('📤 Sending minimal product:');
  console.log(JSON.stringify(minimalProduct, null, 2));
  
  try {
    const response = await axios.put(
      `${baseUrl}/merchants/${merchantId}/items`,
      minimalProduct,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ SUCCESS! Product created:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  // Now test with more fields
  console.log('\n---\n');
  console.log('🧪 Testing product creation with optional fields...\n');
  
  const fullProduct = {
    user_id: userId,
    item: {
      status: 'AVAILABLE',
      categoryId: 'a5486a2d-e4da-4d3f-96cf-49877930ffb3',
      price: {
        value: 65.00,
        originalValue: 75.00
      },
      externalCode: 'PIZZA-001'
    },
    products: [
      {
        name: 'Pizza Margherita Especial',
        description: 'Pizza tradicional italiana com molho de tomate, mussarela de búfala e manjericão fresco'
      }
    ]
  };
  
  console.log('📤 Sending full product:');
  console.log(JSON.stringify(fullProduct, null, 2));
  
  try {
    const response = await axios.put(
      `${baseUrl}/merchants/${merchantId}/items`,
      fullProduct,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ SUCCESS! Product created:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testProductCreation();