const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkStructure() {
  console.log('🔍 Checking token table structure...\n');
  
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
    console.log('📋 Token record fields:');
    Object.keys(data).forEach(key => {
      const value = data[key];
      console.log(`   ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`);
    });
    
    // Check the expires_at format
    console.log('\n🕐 Expires At Analysis:');
    console.log('   Raw value:', data.expires_at);
    console.log('   As seconds timestamp:', new Date(data.expires_at * 1000).toISOString());
    console.log('   As milliseconds timestamp:', new Date(parseInt(data.expires_at)).toISOString());
  }
}

checkStructure();