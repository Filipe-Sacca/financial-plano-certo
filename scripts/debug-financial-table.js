// Script para debugar acesso à tabela financial_data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugFinancialTable() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Debugando acesso à tabela financial_data...\n');
    
    try {
        // Teste 1: Tentar acessar sem filtros
        console.log('📋 Teste 1: Acesso geral à tabela');
        const { data: allData, error: allError } = await supabase
            .from('financial_data')
            .select('*');
            
        console.log('   Data:', allData?.length || 0, 'registros');
        console.log('   Error:', allError?.message || 'Nenhum');
        console.log('   Error Code:', allError?.code || 'N/A');
        
        // Teste 2: Tentar acessar com filtro de user_id
        console.log('\n📋 Teste 2: Acesso com filtro user_id');
        const userId = 'c1488646-aca8-4220-aacc-00e7ae3d6490';
        const { data: filteredData, error: filteredError } = await supabase
            .from('financial_data')
            .select('id, updated_at')
            .eq('user_id', userId);
            
        console.log('   Data:', filteredData?.length || 0, 'registros');
        console.log('   Error:', filteredError?.message || 'Nenhum');
        console.log('   Error Code:', filteredError?.code || 'N/A');
        
        // Teste 3: Verificar estrutura da tabela via RPC (se disponível)
        console.log('\n📋 Teste 3: Verificar se tabela existe');
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('exec', {
                query: `
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'financial_data' 
                    AND table_schema = 'public'
                    ORDER BY ordinal_position;
                `
            });
            
            if (rpcError) {
                console.log('   RPC Error:', rpcError.message);
            } else {
                console.log('   Colunas encontradas:', rpcData?.length || 0);
                rpcData?.forEach(col => {
                    console.log(`     - ${col.column_name}: ${col.data_type}`);
                });
            }
        } catch (rpcErr) {
            console.log('   RPC não disponível:', rpcErr.message);
        }
        
        // Teste 4: Tentar inserir um registro de teste
        console.log('\n📋 Teste 4: Tentar inserir registro de teste');
        const testRecord = {
            user_id: userId,
            merchant_id: 'test-merchant',
            amount: 10.50,
            transaction_type: 'test',
            status: 'test'
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('financial_data')
            .insert(testRecord)
            .select();
            
        console.log('   Insert Data:', insertData?.length || 0, 'registros');
        console.log('   Insert Error:', insertError?.message || 'Nenhum');
        console.log('   Insert Error Code:', insertError?.code || 'N/A');
        
        // Se inseriu, tentar deletar
        if (insertData && insertData.length > 0) {
            console.log('\n📋 Removendo registro de teste...');
            const { error: deleteError } = await supabase
                .from('financial_data')
                .delete()
                .eq('id', insertData[0].id);
                
            console.log('   Delete Error:', deleteError?.message || 'Sucesso');
        }
        
    } catch (err) {
        console.log('❌ Erro geral:', err.message);
    }
}

debugFinancialTable();