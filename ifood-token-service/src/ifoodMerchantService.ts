import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Types
export interface MerchantRequest {
  user_id: string;
  access_token?: string;
}

export interface MerchantData {
  merchant_id: string;
  name: string;
  corporate_name: string;
  user_id: string;
  client_id: string;
  status: boolean; // Changed from string to boolean
}

export interface IFoodMerchant {
  id: string;
  name: string;
  corporateName?: string;
  [key: string]: any;
}

export interface MerchantSyncResult {
  success: boolean;
  total_merchants?: number;
  new_merchants?: string[];
  existing_merchants?: string[];
  errors?: Array<{ merchant_id: string; error: string }>;
  message?: string;
  error?: string;
}

export class IFoodMerchantService {
  private supabase;
  private readonly IFOOD_MERCHANT_URL = 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get access token from database for a specific user
   */
  async getTokenFromDb(userId: string): Promise<any | null> {
    try {
      console.log(`🔍 Fetching token for user_id: ${userId}`);

      const { data, error } = await this.supabase
        .from('ifood_tokens')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching token:', error);
        return null;
      }

      if (data) {
        console.log('✅ Token found for user');
        return data;
      } else {
        console.log('📭 No token found for user');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching token:', error);
      return null;
    }
  }

  /**
   * Fetch merchant list from iFood API
   */
  async fetchMerchantsFromIFood(accessToken: string): Promise<{ success: boolean; merchants: IFoodMerchant[] | { error: string }[] }> {
    try {
      console.log('📡 Fetching merchants from iFood API...');

      const headers = {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };

      const response = await axios.get(this.IFOOD_MERCHANT_URL, { headers });

      if (response.status === 200) {
        const merchants = response.data as IFoodMerchant[];
        console.log(`✅ Successfully fetched ${merchants.length} merchants`);
        return { success: true, merchants };
      } else {
        const errorMsg = `iFood API error: ${response.status} - ${response.statusText}`;
        console.error('❌', errorMsg);
        return { success: false, merchants: [{ error: errorMsg }] };
      }
    } catch (error: any) {
      let errorMsg = 'Error fetching merchants';
      
      if (error.response) {
        errorMsg = `iFood API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMsg = 'Network error: Unable to reach iFood API';
      } else {
        errorMsg = error.message || 'Unknown error fetching merchants';
      }

      console.error('❌', errorMsg);
      return { success: false, merchants: [{ error: errorMsg }] };
    }
  }

  /**
   * Check if merchant already exists in database
   */
  async checkMerchantExists(merchantId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('ifood_merchants')
        .select('merchant_id')
        .eq('merchant_id', merchantId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('❌ Error checking merchant existence:', error);
        return false;
      }

      const exists = !!data;
      
      if (exists) {
        console.log(`📦 Merchant ${merchantId} already exists in database`);
      } else {
        console.log(`🆕 Merchant ${merchantId} not found in database`);
      }

      return exists;
    } catch (error) {
      console.error('❌ Error checking merchant existence:', error);
      return false;
    }
  }

  /**
   * Store merchant in Supabase database
   */
  async storeMerchant(merchant: MerchantData): Promise<{ success: boolean; response: any }> {
    try {
      console.log(`💾 Storing merchant ${merchant.merchant_id} in database...`);

      const { data, error } = await this.supabase
        .from('ifood_merchants')
        .insert({
          merchant_id: merchant.merchant_id,
          name: merchant.name,
          corporate_name: merchant.corporate_name,
          user_id: merchant.user_id,
          client_id: merchant.client_id,
          status: merchant.status
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        return { 
          success: false, 
          response: { error: `Database error: ${error.message}` }
        };
      }

      console.log(`✅ Merchant ${merchant.merchant_id} stored successfully`);
      return { 
        success: true, 
        response: { success: true, merchant_id: merchant.merchant_id, data }
      };
    } catch (error: any) {
      const errorMsg = `Error storing merchant: ${error.message || error}`;
      console.error('❌', errorMsg);
      return { 
        success: false, 
        response: { error: errorMsg }
      };
    }
  }

  /**
   * Main method to process merchant synchronization
   * Replicates the N8N workflow [MERCHANT]:
   * 1. Get access token (from parameter or database)
   * 2. Fetch merchants from iFood API
   * 3. Check each merchant against database
   * 4. Store new merchants
   * 5. Return results
   */
  async processMerchants(userId: string, accessToken?: string): Promise<MerchantSyncResult> {
    try {
      console.log('🎯 Processing merchant synchronization...');
      console.log(`👤 User ID: ${userId}`);

      // Step 1: Get access token and client_id
      let token = accessToken;
      let clientId: string | null = null;

      const tokenData = await this.getTokenFromDb(userId);
      
      if (!token) {
        if (!tokenData) {
          return {
            success: false,
            error: 'No valid token found for user'
          };
        }
        token = tokenData.access_token;
      }
      
      clientId = tokenData?.client_id || null;

      if (!clientId) {
        return {
          success: false,
          error: 'Could not determine client_id'
        };
      }

      // Step 2: Fetch merchants from iFood
      const { success, merchants } = await this.fetchMerchantsFromIFood(token);
      
      if (!success) {
        return {
          success: false,
          error: (merchants[0] as any).error || 'Failed to fetch merchants'
        };
      }

      // Step 3 & 4: Process each merchant
      const results: MerchantSyncResult = {
        success: true,
        total_merchants: (merchants as IFoodMerchant[]).length,
        new_merchants: [],
        existing_merchants: [],
        errors: []
      };

      for (const merchantData of merchants as IFoodMerchant[]) {
        try {
          // Extract merchant information
          const merchant: MerchantData = {
            merchant_id: merchantData.id,
            name: merchantData.name,
            corporate_name: merchantData.corporateName || '',
            user_id: userId,
            client_id: clientId,
            status: true // true = available, false = unavailable/closed
          };

          // Check if merchant exists
          const exists = await this.checkMerchantExists(merchant.merchant_id);
          
          if (exists) {
            results.existing_merchants!.push(merchant.merchant_id);
          } else {
            // Store new merchant
            const { success: stored, response } = await this.storeMerchant(merchant);
            
            if (stored) {
              results.new_merchants!.push(merchant.merchant_id);
            } else {
              results.errors!.push({
                merchant_id: merchant.merchant_id,
                error: response.error
              });
            }
          }
        } catch (error: any) {
          console.error(`❌ Error processing merchant ${merchantData.id}:`, error);
          results.errors!.push({
            merchant_id: merchantData.id,
            error: error.message || 'Unknown error'
          });
        }
      }

      // Step 5: Return results
      results.message = `Processed ${results.total_merchants} merchants: ${results.new_merchants!.length} new, ${results.existing_merchants!.length} existing`;
      
      console.log('✅ Merchant synchronization completed');
      console.log(`📊 Results: ${results.message}`);
      
      return results;
    } catch (error: any) {
      const errorMsg = `Error in merchant processing: ${error.message || error}`;
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }
}