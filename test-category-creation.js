// Teste rápido da criação de categoria
async function testCategoryCreation() {
  try {
    console.log('🧪 Testando criação de categoria...');

    // 1. Primeiro, vamos buscar usuários com tokens válidos
    console.log('1️⃣ Buscando usuários com tokens...');
    const tokenResponse = await fetch('http://localhost:8083/token/user/test-user-001');
    
    if (!tokenResponse.ok) {
      console.log('❌ Nenhum token encontrado para test-user-001');
      console.log('🔍 Vamos testar com um usuário real...');
      
      // Testar com outro usuário conhecido
      const tokenResponse2 = await fetch('http://localhost:8083/token/user/4c5ab8a5-1234-4567-8901-123456789abc');
      
      if (!tokenResponse2.ok) {
        console.log('❌ Também não encontrou token para o segundo usuário');
        console.log('📋 Vamos ver que tokens existem...');
        
        // Vamos testar o endpoint que lista usuários (se funcionar)
        try {
          const listResponse = await fetch('http://localhost:8083/', {
            method: 'GET'
          });
          const listData = await listResponse.json();
          console.log('📊 Endpoints disponíveis:', listData.endpoints);
          
          return;
        } catch (error) {
          console.error('❌ Erro ao listar endpoints:', error);
          return;
        }
      }
      
      const tokenData2 = await tokenResponse2.json();
      console.log('✅ Token encontrado para usuário 2:', !!tokenData2.access_token);
      
      // Usar esse token para testar
      return testWithToken(tokenData2.access_token, '4c5ab8a5-1234-4567-8901-123456789abc');
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token encontrado:', !!tokenData.access_token);
    
    return testWithToken(tokenData.access_token, 'test-user-001');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

async function testWithToken(token, userId) {
  try {
    console.log('2️⃣ Testando criação de categoria com token...');
    
    // Usar um merchant ID que sabemos que existe
    const merchantId = '577cb3b1-5845-4fbc-a219-8cd3939cb9ea';
    
    const categoryResponse = await fetch(`http://localhost:8083/merchants/${merchantId}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        name: 'Categoria Teste API',
        externalCode: `EXT_TEST_${Date.now()}`,
        status: 'AVAILABLE',
        index: 0,
        template: 'DEFAULT'
      })
    });

    const categoryResult = await categoryResponse.json();
    
    console.log('📊 Status da resposta:', categoryResponse.status);
    console.log('📦 Resultado:', categoryResult);
    
    if (categoryResult.success) {
      console.log('✅ Categoria criada com sucesso!');
    } else {
      console.log('❌ Falha ao criar categoria:', categoryResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste com token:', error);
  }
}

// Executar o teste
testCategoryCreation();