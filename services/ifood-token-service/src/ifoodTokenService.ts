import axios from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TokenRequest, TokenResponse, IFoodTokenData, StoredToken, ServiceResponse } from './types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a shared Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export class IFoodTokenService {
  private supabase;
  private readonly IFOOD_TOKEN_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';
  private readonly GRANT_TYPE = 'client_credentials';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Check if a valid token already exists for the client
   */
  async checkExistingToken(clientId: string): Promise<StoredToken | null> {
    try {
      console.log(`🔍 Checking existing token for client_id: ${clientId}`);

      const { data, error } = await this.supabase
        .from('ifood_tokens')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking existing token:', error);
        return null;
      }

      if (!data) {
        console.log('📭 No existing token found');
        return null;
      }

      // Check if token is still valid (expires_at is Unix timestamp in seconds)
      const expiresAtTimestamp = data.expires_at;
      const nowTimestamp = Math.floor(Date.now() / 1000);

      console.log(`🕐 Token expires at: ${expiresAtTimestamp}, now: ${nowTimestamp}`);

      if (expiresAtTimestamp > nowTimestamp) {
        console.log('✅ Valid token found');
        return data as StoredToken;
      } else {
        console.log('⏰ Token expired');
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking existing token:', error);
      return null;
    }
  }

  /**
   * Generate new access token from iFood API
   */
  async generateToken(request: TokenRequest): Promise<ServiceResponse<TokenResponse>> {
    try {
      console.log(`🚀 Generating token for client_id: ${request.clientId}`);

      const payload = new URLSearchParams({
        grantType: this.GRANT_TYPE,
        clientId: request.clientId,
        clientSecret: request.clientSecret
      });

      const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      console.log('📡 Making request to iFood API...');
      const response = await axios.post(this.IFOOD_TOKEN_URL, payload, { headers });

      if (response.status === 200) {
        const tokenData: IFoodTokenData = response.data;
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + (tokenData.expiresIn * 1000));

        const tokenResponse: TokenResponse = {
          access_token: tokenData.accessToken,
          expires_in: tokenData.expiresIn,
          created_at: createdAt.toISOString(),
          expires_at: expiresAt.toISOString()
        };

        console.log('✅ Token generated successfully');
        return {
          success: true,
          data: tokenResponse
        };
      } else {
        const errorMsg = `iFood API error: ${response.status} - ${response.statusText}`;
        console.error('❌', errorMsg);
        return {
          success: false,
          error: errorMsg
        };
      }
    } catch (error: any) {
      let errorMsg = 'Error generating token';
      
      if (error.response) {
        errorMsg = `iFood API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMsg = 'Network error: Unable to reach iFood API';
      } else {
        errorMsg = error.message || 'Unknown error generating token';
      }

      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Store or update token in Supabase ifood_tokens table
   */
  async storeToken(request: TokenRequest, tokenData: TokenResponse, isUpdate: boolean = false): Promise<ServiceResponse<StoredToken>> {
    try {
      console.log(`💾 ${isUpdate ? 'Updating' : 'Storing'} token in Supabase...`);

      // Convert expires_at to timestamp (BIGINT expected by database)
      const expiresAtTimestamp = Math.floor(new Date(tokenData.expires_at).getTime() / 1000);
      const now = new Date().toISOString();

      const storedToken: any = {
        client_id: request.clientId,
        client_secret: request.clientSecret,
        access_token: tokenData.access_token,
        expires_at: expiresAtTimestamp,
        user_id: request.user_id
      };

      // Check if token exists
      const { data: existingToken } = await this.supabase
        .from('ifood_tokens')
        .select('*')
        .eq('client_id', storedToken.client_id)
        .maybeSingle();

      let data, error;

      if (existingToken) {
        // Update existing token
        const updateData: any = {
          access_token: storedToken.access_token,
          expires_at: storedToken.expires_at
        };
        
        ({ data, error } = await this.supabase
          .from('ifood_tokens')
          .update(updateData)
          .eq('client_id', storedToken.client_id)
          .select()
          .single());
        
        console.log(`⏱️ Token updated at: ${now}`);
      } else {
        // Insert new token
        const insertData: any = {
          ...storedToken
        };
        
        ({ data, error } = await this.supabase
          .from('ifood_tokens')
          .insert(insertData)
          .select()
          .single());
      }

      if (error) {
        console.error('❌ Supabase error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      console.log(`✅ Token ${existingToken ? 'updated' : 'stored'} successfully`);
      return {
        success: true,
        data: data as StoredToken
      };
    } catch (error: any) {
      const errorMsg = `Error storing/updating token: ${error.message || error}`;
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Main method to process complete token request flow
   * Replicates the N8N workflow:
   * 1. Check if token exists and is valid
   * 2. If not, generate new token from iFood
   * 3. Store token in Supabase
   * 4. Return response
   */
  async processTokenRequest(clientId: string, clientSecret: string, userId: string, forceRefresh: boolean = false): Promise<ServiceResponse> {
    try {
      console.log('🎯 Processing token request flow...');
      
      // Step 1: Check existing token (skip if forcing refresh)
      if (!forceRefresh) {
        const existingToken = await this.checkExistingToken(clientId);
        if (existingToken) {
          // Check if token will expire in next 5 minutes
          const nowTimestamp = Math.floor(Date.now() / 1000);
          const fiveMinutesFromNow = nowTimestamp + 300;
          
          if (Number(existingToken.expires_at) > fiveMinutesFromNow) {
            return {
              success: true,
              message: 'Valid token already exists',
              data: existingToken
            };
          } else {
            console.log('⚠️ Token expiring soon, refreshing...');
          }
        }
      } else {
        console.log('🔄 Force refresh requested');
      }

      // Step 2: Generate new token
      const request: TokenRequest = {
        clientId,
        clientSecret,
        user_id: userId
      };

      const tokenResult = await this.generateToken(request);
      if (!tokenResult.success) {
        return tokenResult;
      }

      // Step 3: Store/Update token
      const storeResult = await this.storeToken(request, tokenResult.data!, forceRefresh);
      if (!storeResult.success) {
        return storeResult;
      }

      return {
        success: true,
        message: forceRefresh ? 'Token refreshed successfully' : 'Token generated and stored successfully',
        data: storeResult.data
      };
    } catch (error: any) {
      const errorMsg = `Error processing token request: ${error.message || error}`;
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Force refresh token for a specific client
   */
  async refreshToken(clientId: string): Promise<ServiceResponse> {
    try {
      console.log(`🔄 Refreshing token for client: ${clientId}`);
      
      // Get existing token data to retrieve credentials
      const { data: existingToken, error } = await this.supabase
        .from('ifood_tokens')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error || !existingToken) {
        console.error('❌ Error fetching token:', error);
        return {
          success: false,
          error: `Token not found for client: ${clientId}`
        };
      }

      console.log(`📋 Found token for client, proceeding with refresh...`);
      
      // Process with force refresh
      return await this.processTokenRequest(
        existingToken.client_id,
        existingToken.client_secret,
        existingToken.user_id,
        true // Force refresh
      );
    } catch (error: any) {
      const errorMsg = `Error refreshing token: ${error.message || error}`;
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Update all tokens (preventive renewal before expiration)
   */
  async updateAllExpiredTokens(): Promise<ServiceResponse> {
    try {
      console.log('🔍 Fetching all tokens for preventive renewal...');
      
      // Get all tokens
      const { data: tokens, error } = await this.supabase
        .from('ifood_tokens')
        .select('*');

      if (error) {
        console.error('❌ Error fetching tokens:', error);
        return {
          success: false,
          error: 'Failed to fetch tokens from database'
        };
      }

      if (!tokens || tokens.length === 0) {
        console.log('📭 No tokens found');
        return {
          success: true,
          message: 'No tokens found to update'
        };
      }

      console.log(`📋 Found ${tokens.length} tokens to renew preventively`);

      const results = {
        total_tokens: tokens.length,
        tokens_to_renew: tokens.length,
        updated_tokens: 0,
        failed_updates: 0,
        errors: [] as string[]
      };

      // Update ALL tokens preventively (before they expire)
      for (const token of tokens) {
        console.log(`🔄 Renewing token for client: ${token.client_id.substring(0, 8)}...`);
        
        const result = await this.processTokenRequest(
          token.client_id,
          token.client_secret,
          token.user_id,
          true // Force refresh
        );

        if (result.success) {
          results.updated_tokens++;
          console.log(`✅ Token renewed for client: ${token.client_id.substring(0, 8)}...`);
        } else {
          results.failed_updates++;
          results.errors.push(`Client ${token.client_id.substring(0, 8)}...: ${result.error}`);
          console.error(`❌ Failed to renew token for client: ${token.client_id.substring(0, 8)}...`);
        }
      }

      return {
        success: results.failed_updates === 0,
        message: `Renewed ${results.updated_tokens} of ${results.total_tokens} tokens preventively`,
        data: results
      };
    } catch (error: any) {
      const errorMsg = `Error updating tokens: ${error.message || error}`;
      console.error('❌', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Update all tokens - alias for better naming
   */
  async renewAllTokens(): Promise<ServiceResponse> {
    return this.updateAllExpiredTokens();
  }
}

/**
 * Helper function to get token for a specific user
 * Used by the merchant status service
 */
export async function getTokenForUser(userId: string): Promise<StoredToken | null> {
  try {
    const { data, error } = await supabase
      .from('ifood_tokens')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching token for user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getTokenForUser:', error);
    return null;
  }
}