const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkCategoryOrigin() {
  console.log('🔍 Analisando origem das categorias...\n');
  
  // Buscar categorias
  const { data: categories, error } = await supabase
    .from('ifood_categories')
    .select('*')
    .limit(3);
    
  if (error) {
    console.error('Erro:', error);
    return;
  }
  
  console.log('📋 ANÁLISE DAS CATEGORIAS:\n');
  console.log('='*50);
  
  categories.forEach(cat => {
    console.log(`\n📦 Categoria: ${cat.name}`);
    console.log('----------------------------------------');
    
    // Analisar o ID local
    const parts = cat.category_id.split('_');
    console.log(`\n  🏷️ ID LOCAL (Nosso Sistema):`);
    console.log(`     ${cat.category_id}`);
    console.log(`     └─ Prefixo: "${parts[0]}_" (indica categoria)`);
    console.log(`     └─ Timestamp: ${parts[1]} (momento da criação)`);
    console.log(`     └─ Random: ${parts[2]} (string aleatória)`);
    
    // Converter timestamp para data
    if (parts[1]) {
      const date = new Date(parseInt(parts[1]));
      console.log(`     └─ Criado em: ${date.toLocaleString('pt-BR')}`);
    }
    
    console.log(`\n  🌐 ID DO IFOOD (Sistema Deles):`);
    console.log(`     ${cat.ifood_category_id}`);
    console.log(`     └─ Formato: UUID v4 (padrão do iFood)`);
    
    console.log(`\n  📝 Resumo:`);
    console.log(`     - ID Local: GERADO por nós quando criamos a categoria`);
    console.log(`     - ID iFood: RETORNADO pelo iFood após criar lá`);
  });
  
  console.log('\n' + '='*50);
  console.log('\n✅ CONCLUSÃO:');
  console.log('   O category_id é GERADO pelo nosso sistema');
  console.log('   O ifood_category_id é RETORNADO pelo iFood');
  console.log('   Mantemos AMBOS para ter controle local + integração');
}

checkCategoryOrigin();