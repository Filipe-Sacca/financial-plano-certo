const { IFoodTokenService } = require('../services/ifood-token-service/dist/ifoodTokenService');
require('dotenv').config();

/**
 * Script para monitorar atualizações de tokens em tempo real
 */
class TokenMonitor {
  constructor() {
    this.service = new IFoodTokenService(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    this.previousState = new Map();
  }

  /**
   * Captura estado atual dos tokens
   */
  async captureCurrentState() {
    try {
      const statusResult = await this.service.checkTokenExpirationStatus();
      
      if (statusResult.success) {
        const currentState = new Map();
        const tokens = statusResult.data.tokens;
        
        tokens.forEach(token => {
          currentState.set(token.client_id, {
            status: token.status,
            expires_at: token.expires_at,
            minutes_to_expiry: token.minutes_to_expiry,
            timestamp: new Date().toISOString()
          });
        });
        
        return currentState;
      }
      
      return new Map();
    } catch (error) {
      console.error('❌ Erro ao capturar estado:', error);
      return new Map();
    }
  }

  /**
   * Compara estados e detecta mudanças
   */
  detectChanges(currentState, previousState) {
    const changes = [];
    
    for (const [clientId, current] of currentState) {
      const previous = previousState.get(clientId);
      
      if (!previous) {
        changes.push({
          type: 'NEW_TOKEN',
          clientId,
          current,
          message: `🆕 Novo token detectado`
        });
      } else if (current.expires_at !== previous.expires_at) {
        changes.push({
          type: 'TOKEN_UPDATED',
          clientId,
          previous,
          current,
          message: `🔄 Token atualizado`
        });
      } else if (current.status !== previous.status) {
        changes.push({
          type: 'STATUS_CHANGED',
          clientId,
          previous,
          current,
          message: `⚠️ Status mudou de ${previous.status} para ${current.status}`
        });
      }
    }
    
    return changes;
  }

  /**
   * Exibe estatísticas atuais
   */
  async showCurrentStats() {
    const statusResult = await this.service.checkTokenExpirationStatus();
    
    if (statusResult.success) {
      const data = statusResult.data;
      console.log('\n📊 ESTATÍSTICAS ATUAIS:');
      console.log(`   Total de tokens: ${data.total}`);
      console.log(`   Tokens válidos: ${data.valid} ✅`);
      console.log(`   Tokens expirando: ${data.expiring_soon} ⚠️`);
      console.log(`   Tokens expirados: ${data.expired} ❌`);
      
      if (data.tokens.length > 0) {
        console.log('\n📋 DETALHES DOS TOKENS:');
        data.tokens.forEach(token => {
          const statusIcon = token.status === 'valid' ? '✅' : 
                            token.status === 'expiring_soon' ? '⚠️' : '❌';
          console.log(`   ${statusIcon} ${token.client_id}: ${token.status} (expira em ${token.minutes_to_expiry}min)`);
          console.log(`      Data de expiração: ${new Date(token.expires_at).toLocaleString()}`);
        });
      }
    }
  }

  /**
   * Inicia monitoramento contínuo
   */
  async startMonitoring(intervalSeconds = 30) {
    console.log('🔍 ===================================');
    console.log('🔍 MONITOR DE TOKENS INICIADO');
    console.log(`🔍 Verificando a cada ${intervalSeconds} segundos`);
    console.log('🔍 ===================================');

    // Captura estado inicial
    this.previousState = await this.captureCurrentState();
    await this.showCurrentStats();

    // Inicia monitoramento
    setInterval(async () => {
      try {
        console.log(`\n🕐 ${new Date().toLocaleString()} - Verificando mudanças...`);
        
        const currentState = await this.captureCurrentState();
        const changes = this.detectChanges(currentState, this.previousState);
        
        if (changes.length > 0) {
          console.log('\n🚨 MUDANÇAS DETECTADAS:');
          changes.forEach(change => {
            console.log(`\n${change.message} (${change.clientId}):`);
            
            if (change.type === 'TOKEN_UPDATED') {
              console.log(`   Expiração anterior: ${new Date(change.previous.expires_at).toLocaleString()}`);
              console.log(`   Nova expiração: ${new Date(change.current.expires_at).toLocaleString()}`);
              console.log(`   ⏰ Token foi renovado!`);
            } else if (change.type === 'STATUS_CHANGED') {
              console.log(`   Status anterior: ${change.previous.status}`);
              console.log(`   Novo status: ${change.current.status}`);
            }
          });
          
          await this.showCurrentStats();
        } else {
          console.log('   ✅ Nenhuma mudança detectada');
        }
        
        this.previousState = currentState;
        
      } catch (error) {
        console.error('❌ Erro no monitoramento:', error);
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Força uma atualização para teste
   */
  async forceUpdate() {
    console.log('\n🔄 Forçando atualização de tokens para teste...');
    const result = await this.service.updateAllExpiredTokens();
    
    if (result.success) {
      console.log('✅ Atualização forçada realizada com sucesso');
      console.log('📋 Resultado:', JSON.stringify(result.data, null, 2));
    } else {
      console.error('❌ Erro na atualização forçada:', result.error);
    }
  }
}

// Função principal
async function main() {
  const monitor = new TokenMonitor();
  
  // Verifica argumentos da linha de comando
  const args = process.argv.slice(2);
  
  if (args.includes('--force-update')) {
    await monitor.forceUpdate();
    return;
  }
  
  if (args.includes('--stats-only')) {
    await monitor.showCurrentStats();
    return;
  }
  
  // Inicia monitoramento contínuo
  const interval = args.find(arg => arg.startsWith('--interval='));
  const intervalSeconds = interval ? parseInt(interval.split('=')[1]) : 30;
  
  await monitor.startMonitoring(intervalSeconds);
}

// Captura Ctrl+C para sair graciosamente
process.on('SIGINT', () => {
  console.log('\n\n🛑 Monitor interrompido pelo usuário');
  process.exit(0);
});

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

console.log('\n💡 USO:');
console.log('   node monitor-token-updates.js                    # Monitor contínuo (30s)');
console.log('   node monitor-token-updates.js --interval=60      # Monitor a cada 60s');
console.log('   node monitor-token-updates.js --stats-only       # Apenas estatísticas');
console.log('   node monitor-token-updates.js --force-update     # Força atualização');