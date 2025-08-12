import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { IFoodTokenService } from './ifoodTokenService';
import { IFoodMerchantService } from './ifoodMerchantService';
import IFoodMerchantStatusService from './ifoodMerchantStatusService';
import { tokenScheduler } from './tokenScheduler';
import { TokenRequest } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
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
      statusCheck: 'POST /merchant-status/check',
      singleStatus: 'GET /merchant-status/:merchantId',
      startScheduler: 'POST /merchant-status/start-scheduler'
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
  console.log(`📊 Status check: POST http://localhost:${PORT}/merchant-status/check`);
  console.log(`📊 Single status: GET http://localhost:${PORT}/merchant-status/:merchantId`);
  console.log(`⏰ Start scheduler: POST http://localhost:${PORT}/merchant-status/start-scheduler`);
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