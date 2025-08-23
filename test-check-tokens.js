import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTokens() {
  console.log('🔍 Checking existing tokens...');
  
  // Get users with valid tokens
  const { data: tokens, error: tokenError } = await supabase
    .from('ifood_tokens')
    .select('user_id, client_id, expires_at, created_at')
    .order('created_at', { ascending: false });
    
  if (tokenError) {
    console.error('❌ Token error:', tokenError.message);
    return;
  }
  
  console.log('📊 Found tokens:', tokens?.length || 0);
  
  if (tokens && tokens.length > 0) {
    tokens.forEach((token, index) => {
      const isExpired = new Date(token.expires_at) < new Date();
      console.log(`${index + 1}. User ID: ${token.user_id}`);
      console.log(`   Client ID: ${token.client_id}`);
      console.log(`   Expires: ${token.expires_at} (${isExpired ? '❌ EXPIRED' : '✅ VALID'})`);
      console.log(`   Created: ${token.created_at}`);
      console.log('');
    });
  } else {
    console.log('📭 No tokens found in database');
  }
  
  // Get merchants
  console.log('🏪 Checking merchants...');
  const { data: merchants, error: merchantError } = await supabase
    .from('ifood_merchants')
    .select('user_id, merchant_id, name, status')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (merchantError) {
    console.error('❌ Merchant error:', merchantError.message);
    return;
  }
  
  console.log('📊 Found merchants:', merchants?.length || 0);
  
  if (merchants && merchants.length > 0) {
    merchants.forEach((merchant, index) => {
      console.log(`${index + 1}. User ID: ${merchant.user_id}`);
      console.log(`   Merchant ID: ${merchant.merchant_id}`);
      console.log(`   Name: ${merchant.name}`);
      console.log(`   Status: ${merchant.status}`);
      console.log('');
    });
  } else {
    console.log('📭 No merchants found in database');
  }
}

checkTokens().catch(console.error);