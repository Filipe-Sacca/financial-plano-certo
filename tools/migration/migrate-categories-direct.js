const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function migrateCategories() {
  console.log('🚀 Migrando categorias para usar apenas IDs do iFood...\n');
  
  try {
    // 1. Buscar todas as categorias atuais
    const { data: oldCategories, error: fetchError } = await supabase
      .from('ifood_categories')
      .select('*');
      
    if (fetchError) {
      console.error('❌ Erro ao buscar categorias:', fetchError);
      return;
    }
    
    console.log(`📋 Encontradas ${oldCategories.length} categorias para migrar\n`);
    
    // 2. Criar nova tabela temporária
    console.log('📦 Criando estrutura simplificada...');
    
    // Deletar categorias antigas e recriar com estrutura correta
    console.log('🗑️ Limpando categorias antigas...');
    const { error: deleteError } = await supabase
      .from('ifood_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar tudo
      
    if (deleteError) {
      console.error('❌ Erro ao limpar:', deleteError);
    }
    
    // 3. Reinserir com estrutura simplificada
    console.log('✨ Inserindo categorias com estrutura simplificada...\n');
    
    for (const cat of oldCategories) {
      if (!cat.ifood_category_id) {
        console.log(`⚠️ Pulando categoria sem ID do iFood: ${cat.name}`);
        continue;
      }
      
      const newCategory = {
        id: cat.id, // Manter o ID do Supabase
        category_id: cat.ifood_category_id, // Usar ID do iFood como category_id principal
        ifood_category_id: cat.ifood_category_id, // Manter para compatibilidade
        merchant_id: cat.merchant_id,
        catalog_id: cat.catalog_id,
        user_id: cat.user_id,
        name: cat.name,
        external_code: cat.ifood_category_id, // Usar ID do iFood como external_code
        status: cat.status || 'AVAILABLE',
        index: cat.index || 0,
        template: cat.template || 'DEFAULT',
        sequence_number: cat.sequence_number || 0
      };
      
      const { error: insertError } = await supabase
        .from('ifood_categories')
        .insert(newCategory);
        
      if (insertError) {
        console.error(`❌ Erro ao inserir ${cat.name}:`, insertError);
      } else {
        console.log(`✅ Migrada: ${cat.name}`);
        console.log(`   Antes: category_id = ${cat.category_id}`);
        console.log(`   Agora: category_id = ${cat.ifood_category_id} (ID do iFood)\n`);
      }
    }
    
    // 4. Verificar resultado
    console.log('\n📊 Verificando migração...\n');
    const { data: newCategories } = await supabase
      .from('ifood_categories')
      .select('name, category_id, ifood_category_id')
      .limit(5);
      
    if (newCategories) {
      console.log('📋 Categorias após migração:');
      newCategories.forEach(cat => {
        console.log(`\n   📦 ${cat.name}`);
        console.log(`      category_id: ${cat.category_id}`);
        console.log(`      ifood_category_id: ${cat.ifood_category_id}`);
        console.log(`      IDs iguais? ${cat.category_id === cat.ifood_category_id ? '✅ SIM' : '❌ NÃO'}`);
      });
    }
    
    console.log('\n✅ Migração concluída!');
    console.log('   Agora category_id = ifood_category_id');
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

migrateCategories();