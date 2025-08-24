const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkToken() {
  console.log('🔍 Checking token in database...\n');
  
  const userId = 'f133bf28-ff34-47c3-827d-dd2b662f0363';
  
  const { data, error } = await supabase
    .from('ifood_tokens')
    .select('*')
    .eq('client_id', userId)
    .single();
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (data) {
    console.log('✅ Token found!');
    console.log('   Token ID:', data.token_id);
    console.log('   Client ID:', data.client_id);
    console.log('   Access Token:', data.access_token ? data.access_token.substring(0, 20) + '...' : 'NULL');
    console.log('   Last Updated:', data.updated_at);
    console.log('   Expires At:', data.expires_at);
    
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    const isExpired = now > expiresAt;
    
    console.log('   Status:', isExpired ? '❌ EXPIRED' : '✅ VALID');
    
    if (isExpired) {
      console.log('\n⚠️ Token is expired! Needs renewal.');
    }
  } else {
    console.log('❌ No token found for user:', userId);
  }
}

checkToken();