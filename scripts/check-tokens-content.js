// Script para verificar conteúdo da tabela ifood_tokens
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTokensContent() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Erro: Variáveis SUPABASE_URL e SUPABASE_KEY não encontradas');
        console.log('📝 Configure o arquivo .env com suas credenciais do Supabase');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Verificando conteúdo da tabela ifood_tokens...\n');
    
    try {
        // Buscar todos os tokens
        const { data: tokens, error } = await supabase
            .from('ifood_tokens')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.log('❌ Erro ao buscar tokens:', error);
            return;
        }
        
        console.log(`📊 Total de tokens encontrados: ${tokens.length}\n`);
        
        if (tokens.length === 0) {
            console.log('📭 Nenhum token encontrado na tabela!');
            return;
        }
        
        // Analisar cada token
        const now = Math.floor(Date.now() / 1000);
        
        tokens.forEach((token, index) => {
            console.log(`Token #${index + 1}:`);
            console.log(`   ID: ${token.id}`);
            console.log(`   Client ID: ${token.client_id.substring(0, 8)}...`);
            console.log(`   User ID: ${token.user_id || 'N/A'}`);
            console.log(`   Created: ${new Date(token.created_at).toLocaleString()}`);
            console.log(`   Token Updated: ${token.token_updated_at ? new Date(token.token_updated_at).toLocaleString() : 'N/A'}`);
            
            // Verificar expiração
            const expiresAt = Number(token.expires_at);
            const expiresDate = new Date(expiresAt * 1000);
            console.log(`   Expires At: ${expiresDate.toLocaleString()}`);
            
            // Status do token
            const timeToExpiry = expiresAt - now;
            const minutesToExpiry = Math.floor(timeToExpiry / 60);
            
            let status;
            if (expiresAt <= now) {
                status = '🔴 EXPIRADO';
            } else if (minutesToExpiry <= 30) {
                status = '🟡 EXPIRANDO EM BREVE';
            } else {
                status = '🟢 VÁLIDO';
            }
            
            console.log(`   Status: ${status}`);
            if (minutesToExpiry > 0) {
                console.log(`   Minutos para expirar: ${minutesToExpiry}`);
            }
            
            // Verificar se tem access_token
            if (token.access_token) {
                console.log(`   Access Token: ${token.access_token.substring(0, 20)}...`);
            } else {
                console.log(`   Access Token: ❌ AUSENTE`);
            }
            
            console.log('   ---\n');
        });
        
        // Resumo geral
        const expired = tokens.filter(t => Number(t.expires_at) <= now).length;
        const expiringSoon = tokens.filter(t => {
            const exp = Number(t.expires_at);
            const minutesToExp = Math.floor((exp - now) / 60);
            return exp > now && minutesToExp <= 30;
        }).length;
        const valid = tokens.filter(t => {
            const exp = Number(t.expires_at);
            const minutesToExp = Math.floor((exp - now) / 60);
            return exp > now && minutesToExp > 30;
        }).length;
        
        console.log('📋 RESUMO:');
        console.log(`   🔴 Tokens expirados: ${expired}`);
        console.log(`   🟡 Tokens expirando em breve (≤30min): ${expiringSoon}`);
        console.log(`   🟢 Tokens válidos: ${valid}`);
        
        if (expired > 0 || expiringSoon > 0) {
            console.log('\n⚠️  AÇÃO NECESSÁRIA: Existem tokens que precisam ser renovados!');
        }
        
    } catch (err) {
        console.log('❌ Erro:', err.message);
    }
}

checkTokensContent();