const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lzxgqgbazdhpxaipytcl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eGdxZ2JhemRocHhhaXB5dGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAyOTI2MjIsImV4cCI6MjAzNTg2ODYyMn0.WPwHMf3dmE7Xh6Zg'
);

async function checkDB() {
  try {
    console.log('🔍 Consultando banco de dados...');
    
    // Buscar todos os tokens
    const { data: tokens, error } = await supabase
      .from('ifood_tokens')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('❌ Erro ao buscar tokens:', error);
      return;
    }
    
    console.log('📊 Tokens encontrados:', tokens?.length || 0);
    
    if (tokens && tokens.length > 0) {
      tokens.forEach((token, index) => {
        console.log(`\n${index + 1}. Token:`);
        console.log(`   User ID: ${token.user_id}`);
        console.log(`   Client ID: ${token.client_id}`);
        console.log(`   Access Token (primeiros 30 chars): ${token.access_token?.substring(0, 30)}...`);
        console.log(`   Expires: ${token.expires_at}`);
        console.log(`   Created: ${token.created_at}`);
        
        const isExpired = new Date(token.expires_at) < new Date();
        console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
      });
      
      // Testar com o primeiro token válido
      const validToken = tokens.find(t => new Date(t.expires_at) > new Date());
      if (validToken) {
        console.log(`\n🎯 Testando com User ID: ${validToken.user_id}`);
        await testWithRealUser(validToken.user_id);
      }
    }
    
    // Buscar merchants também
    console.log('\n🏪 Consultando merchants...');
    const { data: merchants, error: merchantError } = await supabase
      .from('ifood_merchants')
      .select('*')
      .limit(5);
      
    if (merchantError) {
      console.error('❌ Erro ao buscar merchants:', merchantError);
      return;
    }
    
    console.log('📊 Merchants encontrados:', merchants?.length || 0);
    if (merchants && merchants.length > 0) {
      merchants.forEach((merchant, index) => {
        console.log(`\n${index + 1}. Merchant:`);
        console.log(`   Merchant ID: ${merchant.merchant_id}`);
        console.log(`   User ID: ${merchant.user_id}`);
        console.log(`   Name: ${merchant.name}`);
        console.log(`   Status: ${merchant.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function testWithRealUser(userId) {
  try {
    console.log(`\n🧪 Testando categoria com user_id: ${userId}`);
    
    const response = await fetch(`http://localhost:8083/token/user/${userId}`);
    const result = await response.json();
    
    console.log('📊 Resultado da busca de token:', result);
    
    if (result.success) {
      console.log('✅ Token encontrado! Testando criação de categoria...');
      
      // Testar categoria 
      const merchantId = '577cb3b1-5845-4fbc-a219-8cd3939cb9ea';
      
      const categoryResponse = await fetch(`http://localhost:8083/merchants/${merchantId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.access_token}`
        },
        body: JSON.stringify({
          user_id: userId,
          name: 'Categoria Teste Real',
          externalCode: `EXT_REAL_${Date.now()}`,
          status: 'AVAILABLE',
          index: 0,
          template: 'DEFAULT'
        })
      });

      const categoryResult = await categoryResponse.json();
      
      console.log('📊 Status da categoria:', categoryResponse.status);
      console.log('📦 Resultado da categoria:', categoryResult);
      
    } else {
      console.log('❌ Token não encontrado:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

checkDB();