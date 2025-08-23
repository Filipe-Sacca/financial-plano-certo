// Buscar user_id correto no banco de dados
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lzxgqgbazdhpxaipytcl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eGdxZ2JhemRocHhhaXB5dGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAyOTI2MjIsImV4cCI6MjAzNTg2ODYyMn0.WPwHMf3dmE7Xh6Zg'
);

async function findUser() {
  console.log('🔍 Buscando usuários com tokens válidos...');
  
  const { data: tokens, error } = await supabase
    .from('ifood_tokens')
    .select('user_id, client_id, expires_at, created_at')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log('📊 Tokens encontrados:', tokens?.length || 0);
  
  if (tokens && tokens.length > 0) {
    console.log('📋 Lista de tokens:');
    tokens.forEach((token, index) => {
      const isExpired = new Date(token.expires_at) < new Date();
      console.log(`${index + 1}. User ID: ${token.user_id}`);
      console.log(`   Client ID: ${token.client_id}`);
      console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
      console.log(`   Expires: ${token.expires_at}`);
      console.log('');
    });
    
    // Pegar o primeiro token válido para testar
    const validToken = tokens.find(t => new Date(t.expires_at) > new Date());
    if (validToken) {
      console.log(`✅ Testando com user_id: ${validToken.user_id}`);
      await testCategoryWithUser(validToken.user_id);
    } else {
      console.log('❌ Nenhum token válido encontrado');
    }
  }
}

async function testCategoryWithUser(userId) {
  try {
    console.log('🧪 Testando criação de categoria...');
    
    // Primeiro buscar o token via API
    const tokenResponse = await fetch(`http://localhost:8083/token/user/${userId}`);
    if (!tokenResponse.ok) {
      console.log('❌ Erro ao buscar token via API');
      return;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtido via API');
    
    // Agora testar criação de categoria
    const merchantId = '577cb3b1-5845-4fbc-a219-8cd3939cb9ea';
    
    const categoryResponse = await fetch(`http://localhost:8083/merchants/${merchantId}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      },
      body: JSON.stringify({
        user_id: userId,
        name: 'Categoria Teste Final',
        externalCode: `EXT_FINAL_${Date.now()}`,
        status: 'AVAILABLE',
        index: 0,
        template: 'DEFAULT'
      })
    });

    const result = await categoryResponse.json();
    
    console.log('📊 Status:', categoryResponse.status);
    console.log('📦 Resultado:', result);
    
    if (result.success) {
      console.log('🎉 SUCESSO! Categoria criada!');
    } else {
      console.log('❌ Falha:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

findUser().catch(console.error);