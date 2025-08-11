import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { IFoodTokenService } from './ifoodTokenService';
import { TokenRequest } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ===================================');
  console.log(`🍔 iFood Token Service Started`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Token endpoint: POST http://localhost:${PORT}/token`);
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