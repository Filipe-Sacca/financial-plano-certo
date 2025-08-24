/**
 * Quick script to check users with valid tokens in database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkUsersWithTokens() {
  console.log('🔍 Checking users with valid tokens in database...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get all tokens from database
    console.log('📋 Fetching all tokens from ifood_tokens table...');
    const { data: tokens, error: tokenError } = await supabase
      .from('ifood_tokens')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (tokenError) {
      console.error('❌ Error fetching tokens:', tokenError);
      return;
    }
    
    console.log(`✅ Found ${tokens?.length || 0} tokens in database`);
    
    if (tokens && tokens.length > 0) {
      console.log('\n📊 Token Details:');
      tokens.forEach((token, index) => {
        const isExpired = new Date(token.expires_at) < new Date();
        console.log(`\n${index + 1}. Token Info:`);
        console.log(`   USER_ID: ${token.user_id}`);
        console.log(`   CLIENT_ID: ${token.client_id}`);
        console.log(`   EXPIRES: ${token.expires_at}`);
        console.log(`   STATUS: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
        console.log(`   CREATED: ${token.created_at}`);
      });
      
      // Get merchants for each user
      console.log('\n🏪 Checking merchants for each user...');
      for (const token of tokens) {
        const { data: merchants, error: merchantError } = await supabase
          .from('ifood_merchants')
          .select('merchant_id, name, status')
          .eq('user_id', token.user_id);
          
        if (!merchantError && merchants) {
          console.log(`\n👤 User ${token.user_id}:`);
          console.log(`   Merchants: ${merchants.length}`);
          merchants.forEach(merchant => {
            console.log(`   - ${merchant.merchant_id}: ${merchant.name} (${merchant.status})`);
          });
        }
      }
      
      // Find best user for testing
      const validTokens = tokens.filter(token => new Date(token.expires_at) > new Date());
      if (validTokens.length > 0) {
        const bestUser = validTokens[0];
        console.log(`\n🎯 RECOMMENDED USER_ID FOR TESTING: ${bestUser.user_id}`);
        console.log(`   Client: ${bestUser.client_id}`);
        console.log(`   Expires: ${bestUser.expires_at}`);
      }
    } else {
      console.log('📭 No tokens found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsersWithTokens();