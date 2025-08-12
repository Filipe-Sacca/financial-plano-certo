import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { TokenRequest, TokenResponse, IFoodTokenData, StoredToken, ServiceResponse } from './types';

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
   * Store token in Supabase ifood_tokens table
   */
  async storeToken(request: TokenRequest, tokenData: TokenResponse): Promise<ServiceResponse<StoredToken>> {
    try {
      console.log('💾 Storing token in Supabase...');

      // Convert expires_at to timestamp (BIGINT expected by database)
      const expiresAtTimestamp = Math.floor(new Date(tokenData.expires_at).getTime() / 1000);

      const storedToken = {
        client_id: request.clientId,
        client_secret: request.clientSecret,
        access_token: tokenData.access_token,
        expires_at: expiresAtTimestamp,
        user_id: request.user_id
      };

      // First try to delete existing token for this client_id
      await this.supabase
        .from('ifood_tokens')
        .delete()
        .eq('client_id', storedToken.client_id);

      // Insert new token
      const { data, error } = await this.supabase
        .from('ifood_tokens')
        .insert(storedToken)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      console.log('✅ Token stored successfully');
      return {
        success: true,
        data: data as StoredToken
      };
    } catch (error: any) {
      const errorMsg = `Error storing token: ${error.message || error}`;
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
  async processTokenRequest(clientId: string, clientSecret: string, userId: string): Promise<ServiceResponse> {
    try {
      console.log('🎯 Processing token request flow...');
      
      // Step 1: Check existing token
      const existingToken = await this.checkExistingToken(clientId);
      if (existingToken) {
        return {
          success: true,
          message: 'Valid token already exists',
          data: existingToken
        };
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

      // Step 3: Store token
      const storeResult = await this.storeToken(request, tokenResult.data!);
      if (!storeResult.success) {
        return storeResult;
      }

      return {
        success: true,
        message: 'Token generated and stored successfully',
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
}