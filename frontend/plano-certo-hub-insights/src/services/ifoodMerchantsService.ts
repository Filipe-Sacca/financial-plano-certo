import { supabase } from '../integrations/supabase/client';

// Service URLs
const LOCAL_SERVICE_URL = 'http://localhost:9002';
const N8N_WEBHOOK_URL = 'https://webhook.n8n.hml.planocertodelivery.com/webhook/merchant';

interface MerchantSyncResult {
  success: boolean;
  total_merchants?: number;
  new_merchants?: string[];
  existing_merchants?: string[];
  errors?: Array<{ merchant_id: string; error: string }>;
  message?: string;
  error?: string;
}

/**
 * Check if local service is available
 */
async function checkLocalService(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('❌ Local service not available, will use N8N webhook');
    return false;
  }
}

/**
 * Sync merchants with local service
 */
async function syncMerchantsLocal(userId: string, accessToken?: string): Promise<MerchantSyncResult> {
  try {
    console.log('🏪 Syncing merchants via local service...');
    
    const response = await fetch(`${LOCAL_SERVICE_URL}/merchant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        access_token: accessToken
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to sync merchants');
    }

    return data;
  } catch (error: any) {
    console.error('❌ Local service error:', error);
    throw error;
  }
}

/**
 * Sync merchants with N8N webhook (fallback)
 */
async function syncMerchantsN8N(userId: string, accessToken?: string): Promise<MerchantSyncResult> {
  try {
    console.log('🔄 Syncing merchants via N8N webhook (fallback)...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        access_token: accessToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N webhook error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // N8N might return data in a different format, normalize it
    if (data.output === 'Clientes_existentes') {
      return {
        success: true,
        message: 'Merchants already exist in database',
        existing_merchants: data.merchants || []
      };
    }

    return {
      success: true,
      message: data.message || 'Merchants synced successfully',
      new_merchants: data.new_merchants || [],
      existing_merchants: data.existing_merchants || [],
      total_merchants: data.total_merchants || 0
    };
  } catch (error: any) {
    console.error('❌ N8N webhook error:', error);
    throw error;
  }
}

/**
 * Main function to sync merchants with automatic fallback
 */
export async function syncMerchants(userId: string, accessToken?: string): Promise<MerchantSyncResult> {
  try {
    // Check if we have a user ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    // If no access token provided, try to get it from the database
    if (!accessToken) {
      console.log('🔍 No access token provided, fetching from database...');
      
      const { data: tokenData, error: tokenError } = await supabase
        .from('ifood_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .single();

      if (tokenError || !tokenData) {
        throw new Error('No valid token found for user. Please generate a token first.');
      }

      accessToken = tokenData.access_token;
    }

    // Check if local service is available
    const isLocalAvailable = await checkLocalService();

    // Try local service first, then fallback to N8N
    if (isLocalAvailable) {
      try {
        return await syncMerchantsLocal(userId, accessToken);
      } catch (localError) {
        console.warn('⚠️ Local service failed, trying N8N webhook...', localError);
        return await syncMerchantsN8N(userId, accessToken);
      }
    } else {
      // Local service not available, use N8N directly
      return await syncMerchantsN8N(userId, accessToken);
    }
  } catch (error: any) {
    console.error('❌ Merchant sync failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync merchants'
    };
  }
}

/**
 * Check if a specific merchant exists
 */
export async function checkMerchantExists(merchantId: string): Promise<boolean> {
  try {
    // Try local service first
    const isLocalAvailable = await checkLocalService();
    
    if (isLocalAvailable) {
      const response = await fetch(`${LOCAL_SERVICE_URL}/merchant/check/${merchantId}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
    }

    // Fallback to direct database query
    const { data, error } = await supabase
      .from('ifood_merchants')
      .select('merchant_id')
      .eq('merchant_id', merchantId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking merchant:', error);
    return false;
  }
}

/**
 * Get all merchants for a user
 */
export async function getUserMerchants(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ifood_merchants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return [];
  }
}