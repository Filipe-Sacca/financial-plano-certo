const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function renewToken() {
  console.log('🔄 Renovando token...\n');
  
  const userId = 'c1488646-aca8-4220-aacc-00e7ae3d6490';
  const clientId = 'f133bf28-ff34-47c3-827d-dd2b662f0363';
  
  // Primeiro, buscar o client_secret
  const { data: tokenData, error: tokenError } = await supabase
    .from('ifood_tokens')
    .select('client_secret')
    .eq('user_id', userId)
    .single();
    
  if (tokenError || !tokenData) {
    console.error('❌ Erro ao buscar client_secret:', tokenError);
    return;
  }
  
  console.log('✅ Client secret encontrado');
  
  // Fazer requisição para renovar token
  try {
    const response = await fetch('http://localhost:8083/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: tokenData.client_secret,
        user_id: userId,
        force_refresh: true
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Token renovado com sucesso!');
      console.log('📊 Resultado:', result);
    } else {
      console.error('❌ Erro na renovação:', result);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

renewToken();