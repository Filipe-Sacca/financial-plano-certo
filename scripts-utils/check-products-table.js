require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkProductsTable() {
  console.log('🔍 Verificando tabela products...\n');
  
  try {
    // Tentar buscar alguns produtos para entender a estrutura
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao acessar tabela products:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Tabela products encontrada!');
      console.log(`📊 Total de registros encontrados: ${data.length}\n`);
      
      // Mostrar estrutura dos campos
      const firstRecord = data[0];
      console.log('📋 Estrutura da tabela (campos disponíveis):');
      Object.keys(firstRecord).forEach(key => {
        const value = firstRecord[key];
        const type = typeof value;
        console.log(`  - ${key}: ${type} (exemplo: ${value})`);
      });
      
      console.log('\n📄 Exemplo de registros:');
      console.table(data);
      
    } else {
      console.log('⚠️  Tabela products está vazia');
    }

  } catch (error) {
    console.error('❌ Erro interno:', error.message);
  }
}

checkProductsTable();