const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkRealIfoodCategories() {
  console.log('🔍 Buscando categorias REAIS do iFood...\n');
  
  // Buscar token
  const { data: tokenData } = await supabase
    .from('ifood_tokens')
    .select('access_token')
    .single();
    
  if (!tokenData) {
    console.log('Token não encontrado');
    return;
  }
  
  const merchantId = '577cb3b1-5845-4fbc-a219-8cd3939cb9ea';
  
  try {
    // Buscar catálogo
    const catalogResponse = await axios.get(
      `https://merchant-api.ifood.com.br/catalog/v2.0/merchants/${merchantId}/catalogs`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    const catalogId = catalogResponse.data[0].catalogId;
    console.log(`📚 Catálogo encontrado: ${catalogId}\n`);
    
    // Buscar categorias REAIS do iFood
    const categoriesResponse = await axios.get(
      `https://merchant-api.ifood.com.br/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('📋 CATEGORIAS REAIS DO IFOOD:\n');
    console.log('='*50);
    
    const ifoodCategories = categoriesResponse.data;
    
    if (ifoodCategories && ifoodCategories.length > 0) {
      ifoodCategories.forEach(cat => {
        console.log(`\n🍕 Categoria: ${cat.name}`);
        console.log(`   ID iFood: ${cat.id}`);
        console.log(`   Status: ${cat.status}`);
        console.log(`   Template: ${cat.template || 'N/A'}`);
      });
    } else {
      console.log('❌ Nenhuma categoria encontrada no iFood');
    }
    
    // Comparar com nosso banco
    console.log('\n\n📊 COMPARAÇÃO COM NOSSO BANCO:\n');
    console.log('='*50);
    
    const { data: ourCategories } = await supabase
      .from('ifood_categories')
      .select('*');
      
    console.log('\n🏠 Nossas categorias:');
    ourCategories.forEach(cat => {
      const existsInIfood = ifoodCategories.find(ic => ic.id === cat.ifood_category_id);
      console.log(`\n   📦 ${cat.name}`);
      console.log(`      Nosso ID: ${cat.category_id}`);
      console.log(`      ID iFood salvo: ${cat.ifood_category_id}`);
      console.log(`      Existe no iFood? ${existsInIfood ? '✅ SIM' : '❌ NÃO'}`);
    });
    
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

checkRealIfoodCategories();