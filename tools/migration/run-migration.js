const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function runMigration() {
  console.log('🚀 Executando migração para simplificar tabela de categorias...\n');
  
  try {
    // Ler o arquivo SQL
    const sql = fs.readFileSync('./sql/simplify_categories_table.sql', 'utf8');
    
    // Executar a migração
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Se não funcionar com RPC, tentar executar queries individualmente
      console.log('⚠️ RPC não disponível, executando queries individualmente...\n');
      
      // Verificar se já foi migrado
      const { data: checkTable } = await supabase
        .from('ifood_categories')
        .select('id')
        .limit(1);
      
      if (checkTable && checkTable.length > 0) {
        // Verificar se o ID já é um UUID (já migrado)
        const firstId = checkTable[0].id;
        if (firstId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.log('✅ Tabela já foi migrada! Usando IDs do iFood.');
          return;
        }
      }
      
      console.log('❌ Migração automática falhou. Por favor, execute o SQL manualmente:');
      console.log('📁 Arquivo: sql/simplify_categories_table.sql');
      console.log('\nOu execute no Supabase Dashboard.');
    } else {
      console.log('✅ Migração executada com sucesso!');
    }
    
    // Verificar resultado
    const { data: categories } = await supabase
      .from('ifood_categories')
      .select('*')
      .limit(3);
    
    if (categories) {
      console.log('\n📋 Categorias após migração:');
      categories.forEach(cat => {
        console.log(`\n   📦 ${cat.name}`);
        console.log(`      ID (iFood): ${cat.id}`);
        console.log(`      Merchant: ${cat.merchant_id}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
    console.log('\n⚠️ Execute o SQL manualmente no Supabase Dashboard:');
    console.log('📁 Arquivo: sql/simplify_categories_table.sql');
  }
}

runMigration();