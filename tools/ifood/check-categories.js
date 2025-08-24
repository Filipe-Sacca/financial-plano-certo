const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkCategories() {
  console.log('🔍 Verificando categorias no banco de dados...\n');
  
  // Buscar categorias
  const { data: categories, error } = await supabase
    .from('ifood_categories')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  console.log('📋 Categorias encontradas:');
  categories.forEach(cat => {
    console.log(`\n📦 Categoria: ${cat.name}`);
    console.log(`   - ID Local: ${cat.category_id}`);
    console.log(`   - ID iFood: ${cat.ifood_category_id || 'NÃO DEFINIDO'}`);
    console.log(`   - Merchant: ${cat.merchant_id}`);
  });
}

checkCategories();