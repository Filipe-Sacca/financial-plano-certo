const { IFoodTokenService } = require('../services/ifood-token-service/dist/ifoodTokenService');
require('dotenv').config();

/**
 * Script para testar a nova funcionalidade de verificação de expiração
 */
async function testExpirationCheck() {
  console.log('🧪 ===================================');
  console.log('🧪 TESTE: Verificação de Expiração de Tokens');
  console.log('🧪 ===================================');

  try {
    const service = new IFoodTokenService(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // 1. Testar verificação de status de expiração
    console.log('\n📊 1. Testando verificação de status de expiração...');
    const statusResult = await service.checkTokenExpirationStatus();
    
    if (statusResult.success) {
      console.log('✅ Verificação de status realizada com sucesso');
      console.log('📋 Resultado:', JSON.stringify(statusResult.data, null, 2));
    } else {
      console.error('❌ Erro na verificação de status:', statusResult.error);
    }

    // 2. Testar função isTokenExpiring
    console.log('\n⏰ 2. Testando função isTokenExpiring...');
    
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const testCases = [
      { expires_at: nowTimestamp - 3600, desc: 'Token expirado (1 hora atrás)' },
      { expires_at: nowTimestamp + 900, desc: 'Token expirando em 15 minutos' },
      { expires_at: nowTimestamp + 3600, desc: 'Token válido (expira em 1 hora)' }
    ];

    testCases.forEach(testCase => {
      const isExpiring = service.isTokenExpiring(testCase.expires_at, 30);
      console.log(`   ${isExpiring ? '⚠️' : '✅'} ${testCase.desc}: ${isExpiring ? 'EXPIRANDO' : 'VÁLIDO'}`);
    });

    // 3. Testar renovação apenas de tokens expirando
    console.log('\n🔄 3. Testando renovação de tokens expirando...');
    const renewResult = await service.updateExpiringTokens(30);
    
    if (renewResult.success) {
      console.log('✅ Teste de renovação seletiva realizado com sucesso');
      console.log('📋 Resultado:', JSON.stringify(renewResult.data, null, 2));
    } else {
      console.error('❌ Erro na renovação seletiva:', renewResult.error);
    }

    console.log('\n🧪 ===================================');
    console.log('🧪 TESTE FINALIZADO');
    console.log('🧪 ===================================');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testExpirationCheck();