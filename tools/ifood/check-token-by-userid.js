const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkToken() {
  console.log('🔍 Checking token with different IDs...\n');
  
  const clientId = 'f133bf28-ff34-47c3-827d-dd2b662f0363';
  const userId = 'c1488646-aca8-4220-aacc-00e7ae3d6490';
  
  // Check by client_id
  console.log('📋 Checking by client_id:', clientId);
  const { data: dataClient, error: errorClient } = await supabase
    .from('ifood_tokens')
    .select('*')
    .eq('client_id', clientId)
    .single();
    
  if (dataClient) {
    console.log('✅ Found by client_id!');
    console.log('   user_id in record:', dataClient.user_id);
  } else {
    console.log('❌ Not found by client_id');
  }
  
  // Check by user_id
  console.log('\n📋 Checking by user_id:', userId);
  const { data: dataUser, error: errorUser } = await supabase
    .from('ifood_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (dataUser) {
    console.log('✅ Found by user_id!');
    console.log('   client_id in record:', dataUser.client_id);
  } else {
    console.log('❌ Not found by user_id');
  }
  
  // The userId being passed in the request
  const requestUserId = 'f133bf28-ff34-47c3-827d-dd2b662f0363';
  console.log('\n📋 Checking by request user_id:', requestUserId);
  const { data: dataRequest, error: errorRequest } = await supabase
    .from('ifood_tokens')
    .select('*')
    .eq('user_id', requestUserId)
    .single();
    
  if (dataRequest) {
    console.log('✅ Found by request user_id!');
  } else {
    console.log('❌ Not found by request user_id');
    console.log('   This is the problem - the service is looking for user_id =', requestUserId);
    console.log('   But in the DB, this value is stored as client_id');
  }
}

checkToken();