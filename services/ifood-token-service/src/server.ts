import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { IFoodTokenService, getTokenForUser } from './ifoodTokenService';
import { tokenScheduler } from './tokenScheduler';
import { logCleanupScheduler } from './logCleanupScheduler';
import { TokenRequest } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5001', 'http://localhost:5002', 'http://5.161.109.157:5001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fixed client_secret for token lookup
const FIXED_CLIENT_SECRET = 'gh1x4aatcrge25wtv6j6qx9b1lqktt3vupjxijp10iodlojmj1vytvibqzgai5z0zjd3t5drhxij5ifwf1nlw09z06mt92rx149';

// Middleware
app.use(express.json({ limit: '10mb' }));

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
    message: 'iFood Token Service API',
    endpoints: {
      token: {
        'POST /token': 'Get or create token',
        'GET /token/user/:userId': 'Get token for user',
        'POST /token/refresh': 'Refresh expired token',
        'POST /token/force-refresh/:clientId': 'Force refresh token',
        'POST /token/update-all-expired': 'Update all expired tokens',
        'POST /token/scheduler/start': 'Start token refresh scheduler',
        'POST /token/scheduler/stop': 'Stop token refresh scheduler',
        'GET /token/scheduler/status': 'Get scheduler status'
      },
      merchants: {
        'GET /merchants/:merchantId': 'Get merchant details',
        'POST /merchants/sync-all': 'Sync all merchants',
        'POST /merchants/refresh': 'Refresh merchant data',
        'PUT /merchants/:merchantId/opening-hours': 'Update opening hours',
        'POST /merchants/:merchantId/interruptions': 'Create interruption',
        'GET /merchants/:merchantId/interruptions': 'Get interruptions',
        'DELETE /merchants/:merchantId/interruptions/:interruptionId': 'Delete interruption'
      }
    }
  });
});

// ====== TOKEN ENDPOINTS ======

// Get or create token for client
app.post('/token', async (req, res) => {
  try {
    const tokenRequest = req.body as TokenRequest;
    console.log('📥 Token request received:', tokenRequest);

    const tokenService = new IFoodTokenService(supabaseUrl, supabaseKey);

    // Check if token already exists
    const existingToken = await tokenService.checkExistingToken(tokenRequest.clientId);

    let tokenData;
    if (existingToken && existingToken.access_token) {
      tokenData = existingToken;
    } else {
      // Generate new token
      const tokenResult = await tokenService.generateToken(tokenRequest);
      if (!tokenResult.success) {
        throw new Error(tokenResult.error || 'Failed to generate token');
      }

      // Store the token
      const storeResult = await tokenService.storeToken(tokenRequest, tokenResult.data!, !!existingToken);
      if (!storeResult.success) {
        throw new Error(storeResult.error || 'Failed to store token');
      }

      tokenData = storeResult.data;
    }

    res.json(tokenData);
  } catch (error) {
    console.error('❌ Error in /token:', error);
    res.status(500).json({
      error: 'Failed to get or create token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get token for specific user
app.get('/token/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📥 Getting token for user: ${userId}`);

    // Use the exported function getTokenForUser
    const token = await getTokenForUser(userId);

    if (token) {
      res.json({ token });
    } else {
      res.status(404).json({ error: 'Token not found for user' });
    }
  } catch (error) {
    console.error('❌ Error getting token for user:', error);
    res.status(500).json({
      error: 'Failed to get token for user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh expired token
app.post('/token/refresh', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`🔄 Refreshing token for user: ${userId}`);

    // Get the user's token
    const userToken = await getTokenForUser(userId);

    if (!userToken || !userToken.client_id) {
      throw new Error('No token found for user');
    }

    const tokenService = new IFoodTokenService(supabaseUrl, supabaseKey);
    const result = await tokenService.refreshToken(userToken.client_id);

    if (!result.success) {
      throw new Error(result.error || 'Failed to refresh token');
    }

    const newToken = result.data;

    res.json({ token: newToken });
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Force refresh token
app.post('/token/force-refresh/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { userId } = req.body;

    console.log(`🔄 Force refreshing token for client: ${clientId}, user: ${userId}`);

    const tokenService = new IFoodTokenService(supabaseUrl, supabaseKey);
    const result = await tokenService.refreshToken(clientId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to force refresh token');
    }

    const newToken = result.data;

    res.json({ token: newToken });
  } catch (error) {
    console.error('❌ Error force refreshing token:', error);
    res.status(500).json({
      error: 'Failed to force refresh token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update all expired tokens
app.post('/token/update-all-expired', async (req, res) => {
  try {
    console.log('🔄 Updating all expired tokens');

    const tokenService = new IFoodTokenService(supabaseUrl, supabaseKey);
    const results = await tokenService.updateAllExpiredTokens();

    res.json({
      message: 'Token update process completed',
      results
    });
  } catch (error) {
    console.error('❌ Error updating expired tokens:', error);
    res.status(500).json({
      error: 'Failed to update expired tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Token scheduler endpoints
app.post('/token/scheduler/start', (req, res) => {
  try {
    tokenScheduler.start();
    res.json({
      status: 'success',
      message: 'Token scheduler started'
    });
  } catch (error) {
    console.error('❌ Error starting token scheduler:', error);
    res.status(500).json({
      error: 'Failed to start token scheduler',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/token/scheduler/stop', (req, res) => {
  try {
    tokenScheduler.stop();
    res.json({
      status: 'success',
      message: 'Token scheduler stopped'
    });
  } catch (error) {
    console.error('❌ Error stopping token scheduler:', error);
    res.status(500).json({
      error: 'Failed to stop token scheduler',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/token/scheduler/status', (req, res) => {
  try {
    const status = tokenScheduler.getStatus();
    res.json(status);
  } catch (error) {
    console.error('❌ Error getting token scheduler status:', error);
    res.status(500).json({
      error: 'Failed to get token scheduler status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====== MERCHANT ENDPOINTS ======

// Get merchant details
app.get('/merchants/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;

    console.log(`📥 Getting merchant details: ${merchantId}`);

    // Get token by client_secret
    const { data: tokenData, error: tokenError } = await supabase
      .from('ifood_tokens')
      .select('*')
      .eq('client_secret', FIXED_CLIENT_SECRET)
      .single();

    if (tokenError || !tokenData || !tokenData.access_token) {
      return res.status(401).json({ error: 'Token not found for client_secret' });
    }

    // Fetch merchant details from iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch merchant: ${response.statusText}`);
    }

    const merchantData = await response.json();

    // Fetch opening hours from iFood API
    console.log('🕐 [AUTO-FETCH] Fetching opening hours for merchant...');
    let openingHours = null;
    try {
      const openingHoursResponse = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/opening-hours`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (openingHoursResponse.ok) {
        const openingHoursData = await openingHoursResponse.json();
        const shifts = openingHoursData.shifts || [];

        // Transform shifts: calculate endTime from start + duration (in minutes)
        openingHours = shifts.map((shift: any) => {
          const [hours, minutes, seconds] = shift.start.split(':').map(Number);
          const startMinutes = hours * 60 + minutes;
          const endMinutes = startMinutes + shift.duration;

          const endHours = Math.floor(endMinutes / 60) % 24;
          const endMins = endMinutes % 60;
          const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

          return {
            id: shift.id,
            dayOfWeek: shift.dayOfWeek,
            startTime: shift.start,
            endTime: endTime
          };
        });

        console.log('✅ [AUTO-FETCH] Opening hours fetched successfully:', openingHours.length, 'entries');
      } else {
        console.log('⚠️ [AUTO-FETCH] Failed to fetch opening hours:', openingHoursResponse.status);
      }
    } catch (openingHoursError) {
      console.log('⚠️ [AUTO-FETCH] Error fetching opening hours:', openingHoursError);
    }

    // Store/update merchant in database with opening hours
    const address = (merchantData as any).address || {};
    const { data, error } = await supabase
      .from('ifood_merchants')
      .upsert({
        merchant_id: merchantId,
        user_id: tokenData.user_id,
        name: (merchantData as any).name,
        corporate_name: (merchantData as any).corporateName,
        phone: (merchantData as any).phone,
        description: (merchantData as any).description,
        status: (merchantData as any).status === 'OPEN',
        address_street: address.street,
        address_number: address.number,
        address_complement: address.complement,
        address_neighborhood: address.neighborhood,
        address_city: address.city,
        address_state: address.state,
        address_zip_code: address.zipCode,
        address_country: address.country,
        operating_hours: openingHours,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'merchant_id,user_id'
      });

    if (error) {
      console.error('Error updating merchant in database:', error);
    } else {
      console.log('✅ Merchant saved with opening hours:', openingHours?.length || 0, 'entries');
    }

    res.json(merchantData);
  } catch (error) {
    console.error('❌ Error getting merchant:', error);
    res.status(500).json({
      error: 'Failed to get merchant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync all merchants
app.post('/merchants/sync-all', async (req, res) => {
  try {
    const { user_id } = req.body;

    console.log(`📥 Syncing all merchants for user: ${user_id}`);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get token for user
    const tokenData = await getTokenForUser(user_id);
    if (!tokenData || !tokenData.access_token) {
      return res.status(401).json({ error: 'Token not found for user' });
    }

    // Fetch all merchants from iFood API
    const response = await fetch('https://merchant-api.ifood.com.br/merchant/v1.0/merchants', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch merchants: ${response.statusText}`);
    }

    const merchants = await response.json();

    // Update all merchants in database
    for (const merchant of (merchants as any[])) {
      const address = merchant.address || {};
      await supabase
        .from('ifood_merchants')
        .upsert({
          merchant_id: merchant.id,
          user_id: user_id,
          name: merchant.name,
          corporate_name: merchant.corporateName,
          phone: merchant.phone,
          description: merchant.description,
          status: merchant.status === 'OPEN',
          address_street: address.street,
          address_number: address.number,
          address_complement: address.complement,
          address_neighborhood: address.neighborhood,
          address_city: address.city,
          address_state: address.state,
          address_zip_code: address.zipCode,
          address_country: address.country,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'merchant_id,user_id'
        });
    }

    res.json({
      message: 'Merchants synced successfully',
      count: (merchants as any[]).length,
      merchants
    });
  } catch (error) {
    console.error('❌ Error syncing merchants:', error);
    res.status(500).json({
      error: 'Failed to sync merchants',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh merchant data
app.post('/merchants/refresh', async (req, res) => {
  try {
    const { user_id, merchant_ids } = req.body;

    console.log(`📥 Refreshing merchants for user: ${user_id}`);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get token for user
    const token = await getTokenForUser(user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for user' });
    }

    const merchantsToRefresh = merchant_ids || [];
    const refreshedMerchants = [];

    // If no specific merchants provided, get all from database
    if (merchantsToRefresh.length === 0) {
      const { data } = await supabase
        .from('ifood_merchants')
        .select('id')
        .eq('user_id', user_id);

      if (data) {
        merchantsToRefresh.push(...data.map(m => m.id));
      }
    }

    // Refresh each merchant
    for (const merchantId of merchantsToRefresh) {
      try {
        const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const merchantData = await response.json();
          const address = (merchantData as any).address || {};

          await supabase
            .from('ifood_merchants')
            .upsert({
              merchant_id: merchantId,
              user_id: user_id,
              name: (merchantData as any).name,
              corporate_name: (merchantData as any).corporateName,
              phone: (merchantData as any).phone,
              description: (merchantData as any).description,
              status: (merchantData as any).status === 'OPEN',
              address_street: address.street,
              address_number: address.number,
              address_complement: address.complement,
              address_neighborhood: address.neighborhood,
              address_city: address.city,
              address_state: address.state,
              address_zip_code: address.zipCode,
              address_country: address.country,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'merchant_id,user_id'
            });

          refreshedMerchants.push(merchantData);
        }
      } catch (err) {
        console.error(`Error refreshing merchant ${merchantId}:`, err);
      }
    }

    res.json({
      message: 'Merchants refreshed',
      count: refreshedMerchants.length,
      merchants: refreshedMerchants
    });
  } catch (error) {
    console.error('❌ Error refreshing merchants:', error);
    res.status(500).json({
      error: 'Failed to refresh merchants',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get merchant opening hours from iFood API
app.get('/merchants/:merchantId/opening-hours', async (req, res) => {
  try {
    const { merchantId } = req.params;

    console.log(`📥 Fetching opening hours for merchant: ${merchantId}`);

    // Get token by client_secret
    const { data: tokenData, error: tokenError } = await supabase
      .from('ifood_tokens')
      .select('*')
      .eq('client_secret', FIXED_CLIENT_SECRET)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Token not found for client_secret');
      return res.status(401).json({ error: 'Token not found for client_secret' });
    }

    console.log('✅ Token found, fetching opening hours from iFood API...');

    // Fetch opening hours from iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/opening-hours`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ iFood API error:', response.status, errorText);
      throw new Error(`Failed to fetch opening hours: ${response.statusText}`);
    }

    const openingHoursData = await response.json();

    console.log('✅ Opening hours fetched successfully');
    console.log('📊 [DEBUG] Raw response from iFood API:', JSON.stringify(openingHoursData, null, 2));
    console.log('📊 [DEBUG] Type of response:', typeof openingHoursData);
    console.log('📊 [DEBUG] Is Array?', Array.isArray(openingHoursData));
    console.log('📊 [DEBUG] Shifts array length:', openingHoursData.shifts?.length || 0);

    // Transform shifts: calculate endTime from start + duration (in minutes)
    const shifts = (openingHoursData.shifts || []).map((shift: any) => {
      const [hours, minutes, seconds] = shift.start.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + shift.duration;

      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

      return {
        id: shift.id,
        dayOfWeek: shift.dayOfWeek,
        startTime: shift.start,
        endTime: endTime
      };
    });

    res.json({
      success: true,
      message: 'Opening hours fetched successfully',
      data: shifts
    });
  } catch (error) {
    console.error('❌ Error fetching opening hours:', error);
    res.status(500).json({
      error: 'Failed to fetch opening hours',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update merchant opening hours
app.put('/merchants/:merchantId/opening-hours', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { user_id, opening_hours } = req.body;

    console.log(`📥 Updating opening hours for merchant: ${merchantId}`);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get token for user
    const token = await getTokenForUser(user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for user' });
    }

    // Update opening hours in iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/opening-hours`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opening_hours)
    });

    if (!response.ok) {
      throw new Error(`Failed to update opening hours: ${response.statusText}`);
    }

    const result = await response.json();

    // Update merchant in database
    await supabase
      .from('ifood_merchants')
      .update({
        opening_hours: opening_hours,
        updated_at: new Date().toISOString()
      })
      .eq('merchant_id', merchantId)
      .eq('user_id', user_id);

    res.json({
      message: 'Opening hours updated successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error updating opening hours:', error);
    res.status(500).json({
      error: 'Failed to update opening hours',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete merchant opening hours for a specific day
app.delete('/merchants/:merchantId/opening-hours/delete', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { dayOfWeek } = req.body;

    console.log(`📥 Deleting opening hours for merchant: ${merchantId}, day: ${dayOfWeek}`);

    // Get user_id from merchant
    const { data: merchantData, error: merchantError } = await supabase
      .from('ifood_merchants')
      .select('user_id')
      .eq('merchant_id', merchantId)
      .single();

    if (merchantError || !merchantData) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Get token for user
    const token = await getTokenForUser(merchantData.user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for merchant user' });
    }

    // Delete opening hours for the day in iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/opening-hours`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dayOfWeek })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete opening hours: ${response.statusText}`);
    }

    res.json({
      success: true,
      message: 'Opening hours deleted successfully for the day'
    });
  } catch (error) {
    console.error('❌ Error deleting opening hours:', error);
    res.status(500).json({
      error: 'Failed to delete opening hours',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create merchant interruption
app.post('/merchants/:merchantId/interruptions', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { user_id, interruption } = req.body;

    console.log(`📥 Creating interruption for merchant: ${merchantId}`);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get token for user
    const token = await getTokenForUser(user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for user' });
    }

    // Create interruption in iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/interruptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(interruption)
    });

    if (!response.ok) {
      throw new Error(`Failed to create interruption: ${response.statusText}`);
    }

    const result = await response.json();

    res.json({
      message: 'Interruption created successfully',
      result
    });
  } catch (error) {
    console.error('❌ Error creating interruption:', error);
    res.status(500).json({
      error: 'Failed to create interruption',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get merchant interruptions
app.get('/merchants/:merchantId/interruptions', async (req, res) => {
  try {
    const { merchantId } = req.params;

    console.log(`📥 Getting interruptions for merchant: ${merchantId}`);

    // Get user_id from merchant
    const { data: merchantData, error: merchantError } = await supabase
      .from('ifood_merchants')
      .select('user_id')
      .eq('merchant_id', merchantId)
      .single();

    if (merchantError || !merchantData) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Get token for user
    const token = await getTokenForUser(merchantData.user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for merchant user' });
    }

    // Get interruptions from iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/interruptions`, {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get interruptions: ${response.statusText}`);
    }

    const interruptions = await response.json();

    res.json(interruptions);
  } catch (error) {
    console.error('❌ Error getting interruptions:', error);
    res.status(500).json({
      error: 'Failed to get interruptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync merchant interruptions with iFood API
app.post('/merchants/:merchantId/interruptions/sync', async (req, res) => {
  try {
    const { merchantId } = req.params;

    console.log(`📥 Syncing interruptions for merchant: ${merchantId}`);

    // Get user_id from merchant
    const { data: merchantData, error: merchantError } = await supabase
      .from('ifood_merchants')
      .select('user_id')
      .eq('merchant_id', merchantId)
      .single();

    if (merchantError || !merchantData) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Get token for user
    const token = await getTokenForUser(merchantData.user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for merchant user' });
    }

    // Get interruptions from iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/interruptions`, {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to sync interruptions: ${response.statusText}`);
    }

    const interruptions = await response.json();

    res.json({
      success: true,
      interruptions,
      new_interruptions: 0,
      updated_interruptions: 0,
      deleted_interruptions: 0,
      message: 'Interruptions synced successfully'
    });
  } catch (error) {
    console.error('❌ Error syncing interruptions:', error);
    res.status(500).json({
      error: 'Failed to sync interruptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete merchant interruption
app.delete('/merchants/:merchantId/interruptions/:interruptionId', async (req, res) => {
  try {
    const { merchantId, interruptionId } = req.params;
    const { user_id } = req.body;

    console.log(`📥 Deleting interruption ${interruptionId} for merchant: ${merchantId}`);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get token for user
    const token = await getTokenForUser(user_id);
    if (!token) {
      return res.status(401).json({ error: 'Token not found for user' });
    }

    // Delete interruption in iFood API
    const response = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/interruptions/${interruptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete interruption: ${response.statusText}`);
    }

    res.json({
      message: 'Interruption deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting interruption:', error);
    res.status(500).json({
      error: 'Failed to delete interruption',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====== UTILITY ENDPOINTS ======

// Get all user tokens (for debugging)
app.get('/api/users/tokens', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ifood_credentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching user tokens:', error);
    res.status(500).json({
      error: 'Failed to fetch user tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ifood-token-service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 iFood Token Service running on port ${PORT}`);
  console.log(`📍 Endpoints available at http://localhost:${PORT}`);

  // Start schedulers
  tokenScheduler.start();
  logCleanupScheduler.start();

  console.log('⏰ Token refresh scheduler started');
  console.log('🧹 Log cleanup scheduler started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  tokenScheduler.stop();
  logCleanupScheduler.stop();
  process.exit(0);
});

export default app;