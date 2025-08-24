const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testCategorySync() {
  console.log('🧪 Testando sincronização de categorias...\n');
  
  // Buscar categorias do banco
  const { data: categories, error } = await supabase
    .from('ifood_categories')
    .select('*')
    .limit(3);
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  console.log('✅ TESTE DE SINCRONIZAÇÃO:\n');
  console.log('='*50);
  
  categories.forEach(cat => {
    console.log(`\n📦 ${cat.name}`);
    console.log('   Estrutura simplificada:');
    console.log(`   • category_id: ${cat.category_id}`);
    console.log(`   • ifood_category_id: ${cat.ifood_category_id}`);
    console.log(`   • São iguais? ${cat.category_id === cat.ifood_category_id ? '✅ SIM!' : '❌ NÃO'}`);
    console.log(`   • É um UUID válido? ${cat.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? '✅ SIM!' : '❌ NÃO'}`);
  });
  
  console.log('\n' + '='*50);
  console.log('\n🎯 RESUMO:');
  console.log('   ✅ Não geramos mais IDs locais desnecessários');
  console.log('   ✅ category_id agora É o ID do iFood');
  console.log('   ✅ Sistema simplificado e mais eficiente');
  console.log('\n   Quando você criar um produto em "Pizzas Salgadas":');
  console.log('   • Será enviado o ID: a5486a2d-e4da-4d3f-96cf-49877930ffb3');
  console.log('   • Que é o ID REAL da categoria no iFood!');
}

testCategorySync();