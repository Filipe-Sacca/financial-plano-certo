const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkStructure() {
  console.log('🔍 Verificando estrutura atual da tabela...\n');
  
  // Buscar uma categoria
  const { data, error } = await supabase
    .from('ifood_categories')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('📋 Estrutura atual:');
    console.log('Campos disponíveis:', Object.keys(data[0]));
    console.log('\n📦 Exemplo de categoria:');
    console.log(JSON.stringify(data[0], null, 2));
    
    // Verificar qual campo está sendo usado como ID
    if (data[0].category_id) {
      console.log('\n⚠️ AINDA USANDO ESTRUTURA ANTIGA!');
      console.log('   - Campo "category_id" ainda existe');
      console.log('   - Precisa executar a migração');
    } else if (data[0].id) {
      // Verificar se é UUID do iFood
      if (data[0].id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('\n✅ USANDO ESTRUTURA NOVA!');
        console.log('   - ID é do iFood (UUID)');
      } else {
        console.log('\n⚠️ ESTRUTURA INDEFINIDA');
        console.log('   - Campo "id" existe mas não é UUID do iFood');
      }
    }
  }
}

checkStructure();