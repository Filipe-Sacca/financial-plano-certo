const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkFinalToken() {
  const { data, error } = await supabase
    .from('ifood_tokens')
    .select('access_token, expires_at')
    .eq('user_id', 'c1488646-aca8-4220-aacc-00e7ae3d6490')
    .single();

  if (error || !data) {
    console.log('❌ Token não encontrado');
    return;
  }

  const expiresAt = parseInt(data.expires_at);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = expiresAt <= now;

  console.log('=== STATUS DO TOKEN ===');
  console.log('🔑 Token existe:', !!data.access_token);
  console.log('⏰ Expira em:', new Date(expiresAt * 1000).toISOString());
  console.log('🕐 Agora:', new Date(now * 1000).toISOString());
  console.log('✅ Status:', isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO');
  
  if (!isExpired) {
    const timeLeft = Math.floor((expiresAt - now) / 3600);
    console.log('⏱️ Tempo restante:', timeLeft, 'horas');
  }
}

checkFinalToken();