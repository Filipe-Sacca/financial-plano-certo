"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFoodTokenService = exports.supabase = void 0;
exports.getTokenForUser = getTokenForUser;
exports.getAnyAvailableToken = getAnyAvailableToken;
const axios_1 = __importDefault(require("axios"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Create a shared Supabase client
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
class IFoodTokenService {
    constructor(supabaseUrl, supabaseKey) {
        this.IFOOD_TOKEN_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';
        this.GRANT_TYPE = 'client_credentials';
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    /**
     * Check if a valid token already exists for the client
     */
    async checkExistingToken(clientId) {
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
                return data;
            }
            else {
                console.log('⏰ Token expired');
                return null;
            }
        }
        catch (error) {
            console.error('❌ Error checking existing token:', error);
            return null;
        }
    }
    /**
     * Generate new access token from iFood API
     */
    async generateToken(request) {
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
            const response = await axios_1.default.post(this.IFOOD_TOKEN_URL, payload, { headers });
            if (response.status === 200) {
                const tokenData = response.data;
                const createdAt = new Date();
                const expiresAt = new Date(createdAt.getTime() + (tokenData.expiresIn * 1000));
                const tokenResponse = {
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
            }
            else {
                const errorMsg = `iFood API error: ${response.status} - ${response.statusText}`;
                console.error('❌', errorMsg);
                return {
                    success: false,
                    error: errorMsg
                };
            }
        }
        catch (error) {
            let errorMsg = 'Error generating token';
            if (error.response) {
                errorMsg = `iFood API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            }
            else if (error.request) {
                errorMsg = 'Network error: Unable to reach iFood API';
            }
            else {
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
    async storeToken(request, tokenData, isUpdate = false) {
        try {
            console.log(`💾 ${isUpdate ? 'Updating' : 'Storing'} token in Supabase...`);
            // Convert expires_at to timestamp (BIGINT expected by database)
            const expiresAtTimestamp = Math.floor(new Date(tokenData.expires_at).getTime() / 1000);
            const now = new Date().toISOString();
            const storedToken = {
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
                const updateData = {
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
            }
            else {
                // Insert new token
                const insertData = {
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
                data: data
            };
        }
        catch (error) {
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
    async processTokenRequest(clientId, clientSecret, userId, forceRefresh = false) {
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
                    }
                    else {
                        console.log('⚠️ Token expiring soon, refreshing...');
                    }
                }
            }
            else {
                console.log('🔄 Force refresh requested');
            }
            // Step 2: Generate new token
            const request = {
                clientId,
                clientSecret,
                user_id: userId
            };
            const tokenResult = await this.generateToken(request);
            if (!tokenResult.success) {
                return tokenResult;
            }
            // Step 3: Store/Update token
            const storeResult = await this.storeToken(request, tokenResult.data, forceRefresh);
            if (!storeResult.success) {
                return storeResult;
            }
            return {
                success: true,
                message: forceRefresh ? 'Token refreshed successfully' : 'Token generated and stored successfully',
                data: storeResult.data
            };
        }
        catch (error) {
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
    async refreshToken(clientId) {
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
            return await this.processTokenRequest(existingToken.client_id, existingToken.client_secret, existingToken.user_id, true // Force refresh
            );
        }
        catch (error) {
            const errorMsg = `Error refreshing token: ${error.message || error}`;
            console.error('❌', errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }
    }
    /**
     * Check if a token is about to expire
     */
    isTokenExpiring(expiresAt, thresholdMinutes = 30) {
        const nowTimestamp = Math.floor(Date.now() / 1000);
        const thresholdTimestamp = nowTimestamp + (thresholdMinutes * 60);
        return expiresAt <= thresholdTimestamp;
    }
    /**
     * Check expiration status for all tokens
     */
    async checkTokenExpirationStatus() {
        try {
            console.log('🔍 Checking expiration status for all tokens...');
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
                    message: 'No tokens found',
                    data: { total: 0, expired: 0, expiring_soon: 0, valid: 0 }
                };
            }
            const nowTimestamp = Math.floor(Date.now() / 1000);
            const results = {
                total: tokens.length,
                expired: 0,
                expiring_soon: 0,
                valid: 0,
                tokens: []
            };
            for (const token of tokens) {
                const expiresAt = Number(token.expires_at);
                const timeToExpiry = expiresAt - nowTimestamp;
                const minutesToExpiry = Math.floor(timeToExpiry / 60);
                let status;
                if (expiresAt <= nowTimestamp) {
                    status = 'expired';
                    results.expired++;
                }
                else if (this.isTokenExpiring(expiresAt, 30)) {
                    status = 'expiring_soon';
                    results.expiring_soon++;
                }
                else {
                    status = 'valid';
                    results.valid++;
                }
                results.tokens.push({
                    client_id: token.client_id.substring(0, 8) + '...',
                    status,
                    expires_at: new Date(expiresAt * 1000).toISOString(),
                    minutes_to_expiry: minutesToExpiry > 0 ? minutesToExpiry : 0
                });
            }
            console.log(`📊 Token expiration status:`);
            console.log(`   Total tokens: ${results.total}`);
            console.log(`   Expired: ${results.expired}`);
            console.log(`   Expiring soon (< 30 min): ${results.expiring_soon}`);
            console.log(`   Valid: ${results.valid}`);
            return {
                success: true,
                message: 'Token expiration check completed',
                data: results
            };
        }
        catch (error) {
            const errorMsg = `Error checking token expiration: ${error.message || error}`;
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
    async updateAllExpiredTokens() {
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
                errors: []
            };
            // Update ALL tokens preventively (before they expire)
            for (const token of tokens) {
                console.log(`🔄 Renewing token for client: ${token.client_id.substring(0, 8)}...`);
                const result = await this.processTokenRequest(token.client_id, token.client_secret, token.user_id, true // Force refresh
                );
                if (result.success) {
                    results.updated_tokens++;
                    console.log(`✅ Token renewed for client: ${token.client_id.substring(0, 8)}...`);
                }
                else {
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
        }
        catch (error) {
            const errorMsg = `Error updating tokens: ${error.message || error}`;
            console.error('❌', errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        }
    }
    /**
     * Update only tokens that are expired or expiring soon
     */
    async updateExpiringTokens(thresholdMinutes = 30) {
        try {
            console.log(`🔍 Fetching tokens expiring within ${thresholdMinutes} minutes...`);
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
            // Filter tokens that are expired or expiring soon
            const expiringTokens = tokens.filter(token => {
                const expiresAt = Number(token.expires_at);
                const nowTimestamp = Math.floor(Date.now() / 1000);
                return expiresAt <= nowTimestamp || this.isTokenExpiring(expiresAt, thresholdMinutes);
            });
            console.log(`📋 Found ${expiringTokens.length} of ${tokens.length} tokens that need renewal`);
            if (expiringTokens.length === 0) {
                return {
                    success: true,
                    message: 'No tokens need renewal at this time',
                    data: {
                        total_tokens: tokens.length,
                        tokens_to_renew: 0,
                        updated_tokens: 0,
                        failed_updates: 0,
                        errors: []
                    }
                };
            }
            const results = {
                total_tokens: tokens.length,
                tokens_to_renew: expiringTokens.length,
                updated_tokens: 0,
                failed_updates: 0,
                errors: []
            };
            // Update only expiring tokens
            for (const token of expiringTokens) {
                console.log(`🔄 Renewing expiring token for client: ${token.client_id.substring(0, 8)}...`);
                const result = await this.processTokenRequest(token.client_id, token.client_secret, token.user_id, true);
                if (result.success) {
                    results.updated_tokens++;
                    console.log(`✅ Token renewed for client: ${token.client_id.substring(0, 8)}...`);
                }
                else {
                    results.failed_updates++;
                    results.errors.push(`Client ${token.client_id.substring(0, 8)}...: ${result.error}`);
                    console.error(`❌ Failed to renew token for client: ${token.client_id.substring(0, 8)}...`);
                }
            }
            return {
                success: results.failed_updates === 0,
                message: `Renewed ${results.updated_tokens} of ${results.tokens_to_renew} expiring tokens`,
                data: results
            };
        }
        catch (error) {
            const errorMsg = `Error updating expiring tokens: ${error.message || error}`;
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
    async renewAllTokens() {
        return this.updateAllExpiredTokens();
    }
}
exports.IFoodTokenService = IFoodTokenService;
/**
 * Helper function to get token for a specific user
 * Used by the merchant status service
 */
async function getTokenForUser(userId) {
    try {
        const { data, error } = await exports.supabase
            .from('ifood_tokens')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) {
            console.error('Error fetching token for user:', error);
            return null;
        }
        return data;
    }
    catch (error) {
        console.error('Error in getTokenForUser:', error);
        return null;
    }
}
/**
 * Helper function to get any available token from database
 * Returns the most recently updated token
 */
async function getAnyAvailableToken() {
    try {
        const { data, error } = await exports.supabase
            .from('ifood_tokens')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            console.error('Error fetching any available token:', error);
            return null;
        }
        return data;
    }
    catch (error) {
        console.error('Error in getAnyAvailableToken:', error);
        return null;
    }
}
