import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { IFoodTokenService, getTokenForUser } from './ifoodTokenService';
import { IFoodMerchantService } from './ifoodMerchantService';
import IFoodMerchantStatusService from './ifoodMerchantStatusService';
import { IFoodProductService } from './ifoodProductService';
import { tokenScheduler } from './tokenScheduler';
import { TokenRequest } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [REQUEST] ${timestamp} - ${req.method} ${req.path}`);
  console.log(`🌐 [REQUEST] Origin: ${req.headers.origin || 'N/A'}`);
  console.log(`🔗 [REQUEST] Referer: ${req.headers.referer || 'N/A'}`);
  console.log(`📤 [REQUEST] Content-Type: ${req.headers['content-type'] || 'N/A'}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 [REQUEST] Body:`, req.body);
  }
  
  // Log de resposta
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`📥 [RESPONSE] ${req.method} ${req.path} - Status: ${res.statusCode}`);
    if (typeof body === 'string' && body.length < 500) {
      console.log(`📦 [RESPONSE] Body:`, body);
    }
    return originalSend.call(this, body);
  };
  
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🍔 iFood Integration Service',
    status: 'online',
    endpoints: {
      health: 'GET /health',
      token: 'POST /token',
      refreshToken: 'POST /token/refresh',
      forceRefresh: 'POST /token/force-refresh/:clientId',
      updateAllExpired: 'POST /token/update-all-expired',
      tokenSchedulerStart: 'POST /token/scheduler/start',
      tokenSchedulerStop: 'POST /token/scheduler/stop',
      tokenSchedulerStatus: 'GET /token/scheduler/status',
      merchant: 'POST /merchant',
      merchantCheck: 'GET /merchant/check/:id',
      merchantsSyncAll: 'POST /merchants/sync-all',
      merchantsRefresh: 'POST /merchants/refresh',
      merchantDetail: 'GET /merchants/:merchantId',
      products: 'POST /products',
      statusCheck: 'POST /merchant-status/check',
      singleStatus: 'GET /merchant-status/:merchantId',
      startScheduler: 'POST /merchant-status/start-scheduler',
      updateOpeningHours: 'PUT /merchants/:merchantId/opening-hours',
      createInterruption: 'POST /merchants/:merchantId/interruptions',
      listInterruptions: 'GET /merchants/:merchantId/interruptions',
      removeInterruption: 'DELETE /merchants/:merchantId/interruptions/:interruptionId'
    },
    documentation: 'Check /health for service health',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ifood-token-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Token generation endpoint
app.post('/token', async (req, res) => {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration. Please check environment variables.'
      });
    }

    // Validate request body
    const { clientId, clientSecret, user_id }: TokenRequest = req.body;

    if (!clientId || !clientSecret || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, clientSecret, user_id'
      });
    }

    console.log('🚀 Token request received:', {
      clientId: clientId.substring(0, 8) + '...',
      user_id: user_id.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    });

    // Initialize service and process request
    const service = new IFoodTokenService(supabaseUrl, supabaseKey);
    const result = await service.processTokenRequest(clientId, clientSecret, user_id);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error: any) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Token refresh endpoint
app.post('/token/refresh', async (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    const { clientId, clientSecret, user_id } = req.body;

    if (!clientId || !clientSecret || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: clientId, clientSecret, user_id'
      });
    }

    console.log('🔄 Token refresh requested for client:', clientId.substring(0, 8) + '...');

    const service = new IFoodTokenService(supabaseUrl, supabaseKey);
    const result = await service.processTokenRequest(clientId, clientSecret, user_id, true);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('❌ Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Force refresh token by client ID
app.post('/token/force-refresh/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    console.log('⚡ Force refresh requested for client:', clientId.substring(0, 8) + '...');

    const service = new IFoodTokenService(supabaseUrl, supabaseKey);
    const result = await service.refreshToken(clientId);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('❌ Error force refreshing token:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update all expired tokens endpoint
app.post('/token/update-all-expired', async (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    console.log('🔄 Updating all expired tokens...');

    const service = new IFoodTokenService(supabaseUrl, supabaseKey);
    const result = await service.updateAllExpiredTokens();

    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('❌ Error updating expired tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Token scheduler endpoints
app.post('/token/scheduler/start', (req, res) => {
  try {
    const { intervalMinutes = 120 } = req.body; // Default: 2 hours like N8N
    
    console.log(`⏰ Starting token scheduler with ${intervalMinutes} minute interval...`);
    tokenScheduler.start(intervalMinutes);
    
    res.json({
      success: true,
      message: `Token scheduler started with ${intervalMinutes} minute interval`,
      status: tokenScheduler.getStatus()
    });
  } catch (error: any) {
    console.error('❌ Error starting token scheduler:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/token/scheduler/stop', (req, res) => {
  try {
    tokenScheduler.stop();
    
    res.json({
      success: true,
      message: 'Token scheduler stopped',
      status: tokenScheduler.getStatus()
    });
  } catch (error: any) {
    console.error('❌ Error stopping token scheduler:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/token/scheduler/status', (req, res) => {
  try {
    const status = tokenScheduler.getStatus();
    
    res.json({
      success: true,
      scheduler: 'Token Auto-Renewal',
      ...status
    });
  } catch (error: any) {
    console.error('❌ Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Merchant synchronization endpoint
app.post('/merchant', async (req, res) => {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration. Please check environment variables.'
      });
    }

    // Validate request body
    const { user_id, access_token } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    console.log(`🏪 Processing merchant sync for user: ${user_id}`);

    // Initialize merchant service
    const merchantService = new IFoodMerchantService(supabaseUrl, supabaseKey);
    
    // Process merchants
    const result = await merchantService.processMerchants(user_id, access_token);

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('❌ Merchant sync error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Check merchant endpoint
app.get('/merchant/check/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    // Initialize merchant service
    const merchantService = new IFoodMerchantService(supabaseUrl, supabaseKey);
    
    // Check if merchant exists
    const exists = await merchantService.checkMerchantExists(merchantId);

    return res.json({
      merchant_id: merchantId,
      exists
    });
  } catch (error: any) {
    console.error('❌ Error checking merchant:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Debug endpoint para ver operating_hours
app.get('/merchants/:merchantId/debug', async (req, res) => {
  try {
    const { merchantId } = req.params;
    
    // Usar a mesma instância do supabase que já existe
    const merchantService = new IFoodMerchantService(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    
    const { data, error } = await merchantService.supabase
      .from('ifood_merchants')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();
    
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Individual merchant detail endpoint - Criterion 1.2
app.get('/merchants/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { user_id, access_token } = req.query;

    // Validate required parameters
    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'merchantId is required'
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    console.log(`🔍 Fetching details for merchant: ${merchantId} (user: ${user_id})`);
    console.log(`📊 Request details:`, {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      merchantId,
      user_id
    });

    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    // Initialize merchant service
    const merchantService = new IFoodMerchantService(supabaseUrl, supabaseKey);

    // Note: Removed ownership validation here because we want to allow
    // users to fetch new merchants from iFood API and save them.
    // The getMerchantDetail method will handle the logic internally.

    // Get access token (from parameter or database)
    let token = access_token as string;
    if (!token) {
      const tokenData = await merchantService.getTokenFromDb(user_id as string);
      if (!tokenData || !tokenData.access_token) {
        return res.status(401).json({
          success: false,
          error: 'No valid access token found. Please authenticate with iFood first.'
        });
      }
      token = tokenData.access_token;
    }

    // Fetch merchant details
    console.log(`🔄 Calling getMerchantDetail with:`, { merchantId, userId: user_id, hasToken: !!token });
    const result = await merchantService.getMerchantDetail(merchantId, token, user_id as string);
    
    console.log(`📊 getMerchantDetail result:`, {
      success: result.success,
      hasMarket: !!result.merchant,
      action: result.action,
      error: result.error || 'none'
    });

    if (result.success) {
      console.log(`✅ Successfully retrieved details for merchant: ${result.merchant?.name}`);
      return res.json({
        success: true,
        merchant: result.merchant,
        action: result.action,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Failed to get merchant details: ${result.error}`);
      const statusCode = result.error?.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error(`❌ Error fetching merchant details:`, error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Bulk sync all merchants for a user endpoint - Enhanced synchronization
app.post('/merchants/sync-all', async (req, res) => {
  try {
    const { user_id } = req.body;

    // Validate required parameters
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    console.log(`🔄 Starting bulk merchant sync for user: ${user_id}`);

    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    // Initialize merchant service
    const merchantService = new IFoodMerchantService(supabaseUrl, supabaseKey);

    // Use the new bulk sync method
    const result = await merchantService.syncAllMerchantsForUser(user_id);

    console.log(`✅ Bulk sync completed for user ${user_id}`);
    console.log(`📊 Results: ${result.message}`);

    return res.json({
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ Error in bulk merchant sync:`, error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during bulk merchant sync',
      timestamp: new Date().toISOString()
    });
  }
});

// Refresh all merchants data endpoint
app.post('/merchants/refresh', async (req, res) => {
  try {
    const { user_id, access_token } = req.body;

    // Validate required parameters
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    console.log(`🔄 Starting merchants refresh for user: ${user_id}`);

    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration'
      });
    }

    // Initialize merchant service
    const merchantService = new IFoodMerchantService(supabaseUrl, supabaseKey);

    // Get access token (from parameter or database)
    let token = access_token as string;
    if (!token) {
      const tokenData = await merchantService.getTokenFromDb(user_id as string);
      if (!tokenData || !tokenData.access_token) {
        return res.status(401).json({
          success: false,
          error: 'No valid access token found. Please authenticate with iFood first.'
        });
      }
      token = tokenData.access_token;
    }

    // Step 1: Get all existing merchant_ids for this user from database
    const merchantIdsResult = await merchantService.getUserMerchantIds(user_id);
    
    if (!merchantIdsResult.success) {
      return res.status(500).json({
        success: false,
        error: merchantIdsResult.error || 'Error fetching existing merchants from database'
      });
    }

    if (merchantIdsResult.merchant_ids.length === 0) {
      return res.json({
        success: true,
        message: 'No merchants found to refresh',
        total_merchants: 0,
        refreshed_merchants: [],
        errors: []
      });
    }

    console.log(`📊 Found ${merchantIdsResult.merchant_ids.length} merchants to refresh`);

    // Step 2: Refresh each merchant by calling the individual endpoint logic
    const refreshResults = {
      success: true,
      total_merchants: merchantIdsResult.merchant_ids.length,
      refreshed_merchants: [] as string[],
      errors: [] as Array<{ merchant_id: string; error: string }>,
      skipped_merchants: [] as string[]
    };

    // Process each merchant
    for (const merchantId of merchantIdsResult.merchant_ids) {
      try {
        console.log(`🔄 Refreshing merchant: ${merchantId}`);
        
        // Use the existing getMerchantDetail method to refresh data
        const result = await merchantService.getMerchantDetail(
          merchantId, 
          token, 
          user_id
        );
        
        if (result.success) {
          if (result.action === 'added_from_api') {
            refreshResults.refreshed_merchants.push(merchantId);
            console.log(`✅ Refreshed merchant: ${merchantId}`);
          } else if (result.action === 'found_in_db') {
            refreshResults.skipped_merchants.push(merchantId);
            console.log(`⏭️ Merchant ${merchantId} already up to date`);
          }
        } else {
          refreshResults.errors.push({
            merchant_id: merchantId,
            error: result.error || 'Unknown error during refresh'
          });
          console.log(`❌ Failed to refresh merchant ${merchantId}: ${result.error}`);
        }
      } catch (error: any) {
        console.error(`❌ Error refreshing merchant ${merchantId}:`, error);
        refreshResults.errors.push({
          merchant_id: merchantId,
          error: error.message || 'Unknown error'
        });
      }
    }

    // Step 3: Generate summary message
    const message = `Refresh completed: ${refreshResults.refreshed_merchants.length} updated, ${refreshResults.skipped_merchants.length} already current, ${refreshResults.errors.length} errors`;
    
    console.log(`✅ Merchants refresh completed for user ${user_id}`);
    console.log(`📊 Results: ${message}`);

    return res.json({
      ...refreshResults,
      message,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`❌ Error in merchants refresh:`, error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during merchants refresh',
      timestamp: new Date().toISOString()
    });
  }
});

// Merchant Status endpoints
app.post('/merchant-status/check', async (req, res) => {
  try {
    console.log('📊 Checking all merchant statuses...');
    const result = await IFoodMerchantStatusService.checkAllMerchantStatuses();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/merchant-status/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    console.log(`📊 Checking status for merchant ${merchantId}...`);
    
    const status = await IFoodMerchantStatusService.checkSingleMerchantStatus(merchantId);
    
    if (status) {
      res.json(status);
    } else {
      res.status(404).json({ error: 'Merchant not found or unable to check status' });
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/merchant-status/start-scheduler', async (req, res) => {
  try {
    const { intervalMinutes = 1 } = req.body;
    console.log(`⏰ Starting scheduler with ${intervalMinutes} minute interval...`);
    
    IFoodMerchantStatusService.startScheduler(intervalMinutes);
    
    res.json({
      success: true,
      message: `Scheduler started with ${intervalMinutes} minute interval`
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update opening hours for a specific merchant and day
app.put('/merchants/:merchantId/opening-hours', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { dayOfWeek, startTime, endTime, userId } = req.body;

    console.log(`🔄 PUT opening hours request for merchant: ${merchantId}`);
    console.log(`📅 Day: ${dayOfWeek}, Time: ${startTime} - ${endTime}`);

    // Validate required fields
    if (!dayOfWeek || !startTime || !endTime || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: dayOfWeek, startTime, endTime, userId'
      });
    }

    // Validate dayOfWeek
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    if (!validDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Invalid dayOfWeek. Must be one of: ${validDays.join(', ')}`
      });
    }

    // Get access token for the user
    const tokenData = await getTokenForUser(userId);
    if (!tokenData || !tokenData.access_token) {
      return res.status(401).json({
        success: false,
        message: 'No valid access token found for user'
      });
    }

    // Update opening hours
    const result = await IFoodMerchantStatusService.updateOpeningHours(
      merchantId,
      dayOfWeek,
      startTime,
      endTime,
      tokenData.access_token
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('❌ Error updating opening hours:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create scheduled pause (interruption) for a merchant
app.post('/merchants/:merchantId/interruptions', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { startDate, endDate, reason, description, userId } = req.body;

    console.log(`🔄 POST interruption request for merchant: ${merchantId}`);
    console.log(`📅 Pause: ${startDate} to ${endDate || 'indefinite'}`);

    // Validate required fields
    if (!startDate || !endDate || !description || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: startDate, endDate, description, userId'
      });
    }

    // Get access token for the user
    const tokenData = await getTokenForUser(userId);
    if (!tokenData || !tokenData.access_token) {
      return res.status(401).json({
        success: false,
        message: 'No valid access token found for user'
      });
    }

    // Create scheduled pause
    const result = await IFoodMerchantStatusService.createScheduledPause(
      merchantId,
      startDate,
      endDate,
      description,
      tokenData.access_token,
      userId,
      reason
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('❌ Error creating scheduled pause:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// List scheduled pauses for a merchant
app.get('/merchants/:merchantId/interruptions', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { userId } = req.query;

    console.log(`🔍 GET interruptions request for merchant: ${merchantId}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: userId'
      });
    }

    // Get access token for the user
    const tokenData = await getTokenForUser(userId as string);
    if (!tokenData || !tokenData.access_token) {
      return res.status(401).json({
        success: false,
        message: 'No valid access token found for user'
      });
    }

    // List scheduled pauses
    const result = await IFoodMerchantStatusService.listScheduledPauses(
      merchantId,
      userId as string
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('❌ Error listing scheduled pauses:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove scheduled pause for a merchant
app.delete('/merchants/:merchantId/interruptions/:interruptionId', async (req, res) => {
  try {
    const { merchantId, interruptionId } = req.params;
    const { userId } = req.body;

    console.log(`🗑️ DELETE interruption request: ${interruptionId} for merchant: ${merchantId}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userId'
      });
    }

    // Get access token for the user
    const tokenData = await getTokenForUser(userId);
    if (!tokenData || !tokenData.access_token) {
      return res.status(401).json({
        success: false,
        message: 'No valid access token found for user'
      });
    }

    // Remove scheduled pause
    const result = await IFoodMerchantStatusService.removeScheduledPause(
      merchantId,
      interruptionId,
      tokenData.access_token,
      userId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('❌ Error removing scheduled pause:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Product synchronization endpoint
app.post('/products', async (req, res) => {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase configuration. Please check environment variables.'
      });
    }

    // Validate request body
    const { user_id, access_token } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    console.log(`🛍️ Processing product sync for user: ${user_id}`);

    // Initialize product service
    const productService = new IFoodProductService(supabaseUrl, supabaseKey);
    
    // Process products
    const result = await productService.syncProducts(user_id, access_token);

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('❌ Product sync error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  // Auto-start token scheduler with 2-hour interval (like N8N)
  const AUTO_START_SCHEDULER = process.env.AUTO_START_TOKEN_SCHEDULER !== 'false';
  const SCHEDULER_INTERVAL = parseInt(process.env.TOKEN_SCHEDULER_INTERVAL || '120');
  
  if (AUTO_START_SCHEDULER) {
    console.log('⏰ Auto-starting token scheduler...');
    tokenScheduler.start(SCHEDULER_INTERVAL);
  }

  console.log('🚀 ===================================');
  console.log(`🍔 iFood Token Service Started`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Token endpoint: POST http://localhost:${PORT}/token`);
  console.log(`🏪 Merchant sync: POST http://localhost:${PORT}/merchant`);
  console.log(`🔍 Check merchant: GET http://localhost:${PORT}/merchant/check/:id`);
  console.log(`🔄 Sync all merchants: POST http://localhost:${PORT}/merchants/sync-all`);
  console.log(`♻️ Refresh merchants: POST http://localhost:${PORT}/merchants/refresh`);
  console.log(`👤 Merchant detail: GET http://localhost:${PORT}/merchants/:merchantId?user_id=USER_ID`);
  console.log(`📊 Status check: POST http://localhost:${PORT}/merchant-status/check`);
  console.log(`📊 Single status: GET http://localhost:${PORT}/merchant-status/:merchantId`);
  console.log(`⏰ Start scheduler: POST http://localhost:${PORT}/merchant-status/start-scheduler`);
  console.log(`🕒 Update opening hours: PUT http://localhost:${PORT}/merchants/:merchantId/opening-hours`);
  console.log(`⏸️ Create interruption: POST http://localhost:${PORT}/merchants/:merchantId/interruptions`);
  console.log(`📋 List interruptions: GET http://localhost:${PORT}/merchants/:merchantId/interruptions`);
  console.log(`🗑️ Remove interruption: DELETE http://localhost:${PORT}/merchants/:merchantId/interruptions/:interruptionId`);
  console.log(`🔄 Token scheduler: POST http://localhost:${PORT}/token/scheduler/start`);
  console.log(`🛑 Stop scheduler: POST http://localhost:${PORT}/token/scheduler/stop`);
  console.log(`📊 Scheduler status: GET http://localhost:${PORT}/token/scheduler/status`);
  console.log('🚀 ===================================');

  // Validate environment on startup
  const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);
  
  if (missingEnv.length > 0) {
    console.warn('⚠️  Warning: Missing environment variables:', missingEnv);
    console.warn('⚠️  Please check your .env file');
  } else {
    console.log('✅ Environment variables configured correctly');
  }
});

export default app;