/**
 * Script independente para limpeza de logs de polling iFood
 * Executa todos os dias às 6h da manhã
 * 
 * Para agendar no Windows:
 * 1. Abra o Agendador de Tarefas (Task Scheduler)
 * 2. Crie nova tarefa básica
 * 3. Configure para executar diariamente às 6:00
 * 4. Ação: node "C:\Users\gilma\Nova pasta (2)\scripts\cleanup-polling-logs.js"
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function cleanupPollingLogs() {
  console.log('🧹 ===================================');
  console.log(`🗑️ DAILY LOG CLEANUP started at ${new Date().toISOString()}`);
  console.log('🎯 Target: ifood_polling_log table');
  console.log('🧹 ===================================');

  try {
    // Validate environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Check .env file.');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get count before deletion
    console.log('📊 Counting current logs...');
    const { count: beforeCount, error: countError } = await supabase
      .from('ifood_polling_log')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      if (countError.message.includes('relation') && countError.message.includes('does not exist')) {
        console.log('ℹ️ Table ifood_polling_log does not exist yet - nothing to clean');
        console.log('✅ Cleanup completed - no table to clean');
        return;
      }
      throw new Error(`Error counting logs: ${countError.message}`);
    }

    console.log(`📊 Current logs in database: ${beforeCount || 0}`);

    if (!beforeCount || beforeCount === 0) {
      console.log('ℹ️ No logs found to clean up');
      console.log('✅ Cleanup completed - no logs to clean');
      return;
    }

    // Method 1: Try batch deletion using created_at timestamp
    console.log('🔄 Attempting batch deletion...');
    let deletedCount = 0;
    const batchSize = 100;
    const maxBatches = Math.ceil(beforeCount / batchSize);

    for (let batch = 0; batch < maxBatches; batch++) {
      try {
        // Get a batch of logs to delete
        const { data: logBatch, error: fetchError } = await supabase
          .from('ifood_polling_log')
          .select('id')
          .limit(batchSize);

        if (fetchError) {
          console.warn(`⚠️ Error fetching batch ${batch + 1}: ${fetchError.message}`);
          continue;
        }

        if (!logBatch || logBatch.length === 0) {
          console.log('✅ No more logs to delete');
          break;
        }

        // Delete this batch using created_at <= now (should match all records)
        const now = new Date().toISOString();
        const { error: deleteError } = await supabase
          .from('ifood_polling_log')
          .delete()
          .lte('created_at', now)
          .limit(batchSize);

        if (deleteError) {
          console.warn(`⚠️ Error deleting batch ${batch + 1}: ${deleteError.message}`);
          
          // Try alternative method for this batch
          const ids = logBatch.map(log => log.id);
          const { error: altDeleteError } = await supabase
            .from('ifood_polling_log')
            .delete()
            .in('id', ids);
          
          if (altDeleteError) {
            console.error(`❌ Both methods failed for batch ${batch + 1}`);
            continue;
          } else {
            deletedCount += logBatch.length;
            console.log(`✅ Alternative method succeeded for batch ${batch + 1}: ${logBatch.length} logs`);
          }
        } else {
          deletedCount += logBatch.length;
          console.log(`✅ Deleted batch ${batch + 1}: ${logBatch.length} logs`);
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (batchError) {
        console.error(`❌ Unexpected error in batch ${batch + 1}:`, batchError.message);
        continue;
      }
    }

    // Final verification
    const { count: afterCount } = await supabase
      .from('ifood_polling_log')
      .select('*', { count: 'exact', head: true });

    const actualDeleted = (beforeCount || 0) - (afterCount || 0);

    console.log('✅ Log cleanup completed successfully');
    console.log(`📊 Cleanup Statistics:`);
    console.log(`   - Logs before cleanup: ${beforeCount || 0}`);
    console.log(`   - Logs deleted: ${actualDeleted}`);
    console.log(`   - Logs remaining: ${afterCount || 0}`);
    console.log(`   - Batches processed: ${maxBatches}`);

    if (actualDeleted > 0) {
      console.log('💚 Database space freed up successfully!');
    } else {
      console.log('⚠️ No logs were deleted - check for permission issues');
    }

    console.log('🧹 ===================================');
    console.log(`🕕 Next cleanup should be scheduled for tomorrow at 6:00 AM`);
    console.log('🧹 ===================================');

  } catch (error) {
    console.error('❌ Log cleanup failed:', error.message);
    console.log('🧹 ===================================');
    
    // Exit with error code so task scheduler knows it failed
    process.exit(1);
  }
}

// Execute cleanup
cleanupPollingLogs()
  .then(() => {
    console.log('✅ Cleanup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup script failed:', error.message);
    process.exit(1);
  });