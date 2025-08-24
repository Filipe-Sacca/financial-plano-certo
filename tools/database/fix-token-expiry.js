const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './services/ifood-token-service/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function fixTokenExpiry() {
  console.log('🔧 Fixing token expiry date...\n');
  
  const userId = 'f133bf28-ff34-47c3-827d-dd2b662f0363';
  
  // The expires_at seems to be in seconds, not milliseconds
  // Let's update it to be valid for 24 hours from now
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const { data, error } = await supabase
    .from('ifood_tokens')
    .update({
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString()
    })
    .eq('client_id', userId);
    
  if (error) {
    console.error('❌ Error updating token:', error);
    return;
  }
  
  console.log('✅ Token expiry updated!');
  console.log('   Now:', now.toISOString());
  console.log('   Expires at:', expiresAt.toISOString());
  
  // Verify the update
  const { data: verifyData, error: verifyError } = await supabase
    .from('ifood_tokens')
    .select('expires_at, updated_at')
    .eq('client_id', userId)
    .single();
    
  if (verifyData) {
    console.log('\n📋 Verification:');
    console.log('   Expires at in DB:', verifyData.expires_at);
    console.log('   Updated at in DB:', verifyData.updated_at);
  }
}

fixTokenExpiry();