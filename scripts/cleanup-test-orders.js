// Quick script to delete test orders
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function cleanupTestOrders() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const userId = 'c1488646-aca8-4220-aacc-00e7ae3d6490';

  console.log('🧹 Cleaning up test orders...');

  try {
    // Delete test orders
    const { data: deletedOrders, error } = await supabase
      .from('ifood_orders')
      .delete()
      .eq('user_id', userId)
      .or('ifood_order_id.like.test-%,customer_name.in.(Cliente Teste,Pedro Costa,João Silva,Maria Santos)')
      .select();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Deleted ${deletedOrders?.length || 0} test orders`);
    console.log('📋 Deleted orders:', deletedOrders?.map(o => o.ifood_order_id) || []);

    // Check remaining orders
    const { data: remainingOrders, error: fetchError } = await supabase
      .from('ifood_orders')
      .select('ifood_order_id, customer_name, total_amount')
      .eq('user_id', userId);

    if (!fetchError) {
      console.log(`📊 Remaining orders: ${remainingOrders?.length || 0}`);
      remainingOrders?.forEach(order => {
        console.log(`   - ${order.ifood_order_id}: ${order.customer_name} - R$ ${order.total_amount || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

cleanupTestOrders();