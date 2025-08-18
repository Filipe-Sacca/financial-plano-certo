// Verificar e corrigir estrutura da tabela ifood_tokens
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkAndFixTable() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Verificando estrutura da tabela ifood_tokens...\n');
    
    try {
        // 1. Verificar se a coluna updated_at existe
        const { data, error } = await supabase.rpc('exec', {
            query: `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'ifood_tokens' 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            `
        });
        
        if (error) {
            console.log('❌ Erro ao verificar colunas:', error);
            
            // Fallback: tentar query direta na tabela
            console.log('🔄 Tentando verificação alternativa...');
            const { data: testData, error: testError } = await supabase
                .from('ifood_tokens')
                .select('*')
                .limit(1);
                
            if (testError) {
                console.log('❌ Erro no fallback:', testError);
            } else {
                console.log('✅ Tabela acessível, dados encontrados:', testData.length);
                if (testData.length > 0) {
                    console.log('📊 Estrutura detectada (baseada no primeiro registro):');
                    console.log('   Colunas:', Object.keys(testData[0]));
                }
            }
        } else {
            console.log('📊 Colunas na tabela ifood_tokens:');
            data.forEach((col, index) => {
                console.log(`   ${index + 1}. ${col.column_name}`);
            });
        }
        
    } catch (err) {
        console.log('❌ Erro:', err.message);
    }
}

checkAndFixTable();