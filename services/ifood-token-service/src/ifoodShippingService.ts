/**
 * iFood Shipping Service
 * Manages shipping operations for platform and external orders
 * Implements all official iFood Shipping API endpoints
 * 
 * API Documentation: /docs/IFOOD_SHIPPING_API_SPECIFICATION.md
 * Base URL: https://merchant-api.ifood.com.br/shipping/v1
 */

import axios, { AxiosInstance } from 'axios';
import { getTokenForUser } from './ifoodTokenService';

// ==================== TYPE DEFINITIONS ====================

export interface ShippingAddress {
  streetName: string;
  streetNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  reference?: string;
}

export interface ShippingEvent {
  id: string;
  createdAt: string;
  fullCode: {
    code: string;
    subCode?: string;
    message?: string;
  };
  metadata?: Record<string, any>;
  orderId?: string;
  orderExternalId?: string;
  externalId?: string;
  merchantExternalCode?: string;
}

export interface DeliveryPerson {
  name: string;
  phone: string;
  document?: string;
  vehicleType?: 'MOTORCYCLE' | 'BICYCLE' | 'CAR' | 'WALKER';
  vehiclePlate?: string;
}

export interface ShippingStatus {
  orderId?: string;
  externalId?: string;
  status: 'REQUESTED' | 'ACKNOWLEDGED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'DISPATCHED' | 'ARRIVED_AT_DELIVERY' | 'DELIVERED' | 'CONCLUDED' | 'CANCELLED';
  subStatus?: string;
  estimatedDeliveryTime?: string;
  deliveryPerson?: DeliveryPerson;
  trackingUrl?: string;
  events?: ShippingEvent[];
}

export interface AddressChangeRequest {
  eventId: string;
  orderId?: string;
  externalId?: string;
  newAddress: ShippingAddress;
  changeReason: string;
  customerNote?: string;
}

export interface AddressChangeResponse {
  accepted: boolean;
  reason?: string;
  additionalFee?: number;
  estimatedTime?: string;
}

export interface SafeDeliveryScore {
  orderId?: string;
  externalId?: string;
  score: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  factors: {
    addressVerification: number;
    customerHistory: number;
    deliveryTimeRisk: number;
    areaRisk: number;
  };
}

export interface EventAcknowledgment {
  eventId: string;
  acknowledged: boolean;
  timestamp: string;
}

export interface StatusUpdateRequest {
  orderId?: string;
  externalId?: string;
  status: string;
  subStatus?: string;
  metadata?: Record<string, any>;
}

// ==================== SERVICE CLASS ====================

export class IFoodShippingService {
  private apiClient: AxiosInstance;
  private merchantId: string;
  private userId: string;
  private pollingInterval: NodeJS.Timeout | null = null;
  private processedEvents: Set<string> = new Set();
  private readonly BASE_URL = 'https://merchant-api.ifood.com.br/shipping/v1';
  private readonly POLL_INTERVAL = 30000; // 30 seconds
  private readonly ADDRESS_CHANGE_TIMEOUT = 900000; // 15 minutes
  
  constructor(merchantId: string, userId: string) {
    this.merchantId = merchantId;
    this.userId = userId;
    
    this.apiClient = axios.create({
      baseURL: this.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for authentication
    this.apiClient.interceptors.request.use(async (config) => {
      try {
        console.log(`🔑 [SHIPPING-SERVICE] Getting token for user: ${this.userId}`);
        const tokenData = await getTokenForUser(this.userId);
        if (tokenData && tokenData.access_token) {
          config.headers.Authorization = `Bearer ${tokenData.access_token}`;
          console.log(`✅ [SHIPPING-SERVICE] Token added to request`);
        } else {
          console.error(`❌ [SHIPPING-SERVICE] No token found for user: ${this.userId}`);
        }
        return config;
      } catch (error) {
        console.error(`❌ [SHIPPING-SERVICE] Error getting token:`, error);
        return config;
      }
    });

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.error('⚠️ [SHIPPING-SERVICE] Rate limit exceeded. Implementing exponential backoff...');
          await this.sleep(2000);
          return this.apiClient.request(error.config);
        }
        
        if (error.response?.status === 401) {
          console.error('🔒 [SHIPPING-SERVICE] Authentication failed. Token may be expired.');
        }
        
        throw error;
      }
    );
  }

  // ==================== POLLING & EVENT MANAGEMENT ====================

  /**
   * Start polling for shipping events
   * GET /events/polling
   */
  async startPolling(onEvent: (event: ShippingEvent) => Promise<void>): Promise<void> {
    if (this.pollingInterval) {
      console.log('⚠️ [SHIPPING-SERVICE] Polling already active');
      return;
    }

    console.log('🔄 [SHIPPING-SERVICE] Starting event polling...');
    
    const poll = async () => {
      try {
        const response = await this.apiClient.get<ShippingEvent[]>('/events/polling');
        const events = response.data || [];
        
        console.log(`📨 [SHIPPING-SERVICE] Received ${events.length} events`);
        
        for (const event of events) {
          // Deduplication check
          if (this.processedEvents.has(event.id)) {
            console.log(`⏭️ [SHIPPING-SERVICE] Skipping duplicate event: ${event.id}`);
            continue;
          }
          
          this.processedEvents.add(event.id);
          
          try {
            // Process event
            await onEvent(event);
            
            // Acknowledge event
            await this.acknowledgeEvent(event.id);
            
            // Handle address change timeout
            if (event.fullCode.code === 'ADDRESS_CHANGE_REQUESTED') {
              this.scheduleAddressChangeTimeout(event);
            }
          } catch (error) {
            console.error(`❌ [SHIPPING-SERVICE] Error processing event ${event.id}:`, error);
          }
        }
        
        // Cleanup old processed events (keep last 1000)
        if (this.processedEvents.size > 1000) {
          const eventArray = Array.from(this.processedEvents);
          this.processedEvents = new Set(eventArray.slice(-1000));
        }
      } catch (error: any) {
        console.error('❌ [SHIPPING-SERVICE] Polling error:', error.message);
      }
    };

    // Initial poll
    await poll();
    
    // Set up interval
    this.pollingInterval = setInterval(poll, this.POLL_INTERVAL);
  }

  /**
   * Stop polling for events
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ [SHIPPING-SERVICE] Event polling stopped');
    }
  }

  /**
   * Acknowledge event receipt
   * POST /events/{eventId}/acknowledgment
   */
  async acknowledgeEvent(eventId: string): Promise<EventAcknowledgment> {
    try {
      console.log(`✔️ [SHIPPING-SERVICE] Acknowledging event: ${eventId}`);
      
      const response = await this.apiClient.post<EventAcknowledgment>(
        `/events/${eventId}/acknowledgment`,
        {
          acknowledged: true,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`✅ [SHIPPING-SERVICE] Event acknowledged: ${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error acknowledging event:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Update shipping status for platform orders
   * POST /orders/{orderId}/status
   */
  async updateOrderStatus(orderId: string, status: string, subStatus?: string, metadata?: Record<string, any>): Promise<ShippingStatus> {
    try {
      console.log(`📮 [SHIPPING-SERVICE] Updating status for order: ${orderId} to ${status}`);
      
      const response = await this.apiClient.post<ShippingStatus>(
        `/orders/${orderId}/status`,
        {
          status,
          subStatus,
          metadata,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`✅ [SHIPPING-SERVICE] Status updated for order: ${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error updating order status:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update shipping status for external orders
   * POST /external/{externalId}/status
   */
  async updateExternalStatus(externalId: string, status: string, subStatus?: string, metadata?: Record<string, any>): Promise<ShippingStatus> {
    try {
      console.log(`📮 [SHIPPING-SERVICE] Updating status for external order: ${externalId} to ${status}`);
      
      const response = await this.apiClient.post<ShippingStatus>(
        `/external/${externalId}/status`,
        {
          status,
          subStatus,
          metadata,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`✅ [SHIPPING-SERVICE] Status updated for external order: ${externalId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error updating external status:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get shipping status
   */
  async getShippingStatus(orderId?: string, externalId?: string): Promise<ShippingStatus> {
    try {
      const identifier = orderId || externalId;
      const path = orderId ? `/orders/${orderId}/status` : `/external/${externalId}/status`;
      
      console.log(`🔍 [SHIPPING-SERVICE] Getting status for: ${identifier}`);
      
      const response = await this.apiClient.get<ShippingStatus>(path);
      
      console.log(`✅ [SHIPPING-SERVICE] Retrieved status for: ${identifier}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error getting status:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== ADDRESS CHANGE MANAGEMENT ====================

  /**
   * Handle address change request
   * POST /address-change/{eventId}/response
   */
  async respondToAddressChange(
    eventId: string, 
    accept: boolean, 
    reason?: string, 
    additionalFee?: number
  ): Promise<AddressChangeResponse> {
    try {
      console.log(`📍 [SHIPPING-SERVICE] Responding to address change: ${eventId} - ${accept ? 'ACCEPT' : 'REJECT'}`);
      
      const response = await this.apiClient.post<AddressChangeResponse>(
        `/address-change/${eventId}/response`,
        {
          accepted: accept,
          reason,
          additionalFee,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`✅ [SHIPPING-SERVICE] Address change response sent: ${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error responding to address change:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Schedule automatic rejection of address change after 15 minutes
   */
  private scheduleAddressChangeTimeout(event: ShippingEvent): void {
    console.log(`⏰ [SHIPPING-SERVICE] Scheduling timeout for address change: ${event.id}`);
    
    setTimeout(async () => {
      try {
        console.log(`⏱️ [SHIPPING-SERVICE] Address change timeout reached: ${event.id}`);
        await this.respondToAddressChange(
          event.id,
          false,
          'Timeout - No response within 15 minutes'
        );
      } catch (error) {
        console.error(`❌ [SHIPPING-SERVICE] Error auto-rejecting address change: ${event.id}`, error);
      }
    }, this.ADDRESS_CHANGE_TIMEOUT);
  }

  // ==================== SAFE DELIVERY ====================

  /**
   * Get Safe Delivery score for an order
   * GET /safe-delivery/score/{orderId}
   */
  async getSafeDeliveryScore(orderId?: string, externalId?: string): Promise<SafeDeliveryScore> {
    try {
      const identifier = orderId || externalId;
      const path = orderId ? `/safe-delivery/score/${orderId}` : `/safe-delivery/external/${externalId}`;
      
      console.log(`🛡️ [SHIPPING-SERVICE] Getting Safe Delivery score for: ${identifier}`);
      
      const response = await this.apiClient.get<SafeDeliveryScore>(path);
      
      console.log(`✅ [SHIPPING-SERVICE] Safe Delivery score retrieved: ${response.data.score} (${response.data.riskLevel})`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error getting Safe Delivery score:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Report Safe Delivery incident
   * POST /safe-delivery/incident
   */
  async reportSafeDeliveryIncident(
    orderId: string | undefined,
    externalId: string | undefined,
    incidentType: string,
    description: string
  ): Promise<void> {
    try {
      const identifier = orderId || externalId;
      console.log(`🚨 [SHIPPING-SERVICE] Reporting Safe Delivery incident for: ${identifier}`);
      
      await this.apiClient.post('/safe-delivery/incident', {
        orderId,
        externalId,
        incidentType,
        description,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ [SHIPPING-SERVICE] Incident reported for: ${identifier}`);
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error reporting incident:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== DELIVERY PERSON MANAGEMENT ====================

  /**
   * Update delivery person information
   * PUT /delivery-person/{orderId}
   */
  async updateDeliveryPerson(
    orderId: string | undefined,
    externalId: string | undefined,
    deliveryPerson: DeliveryPerson
  ): Promise<void> {
    try {
      const identifier = orderId || externalId;
      const path = orderId ? `/delivery-person/${orderId}` : `/delivery-person/external/${externalId}`;
      
      console.log(`🚴 [SHIPPING-SERVICE] Updating delivery person for: ${identifier}`);
      
      await this.apiClient.put(path, deliveryPerson);

      console.log(`✅ [SHIPPING-SERVICE] Delivery person updated for: ${identifier}`);
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error updating delivery person:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== TRACKING ====================

  /**
   * Get tracking URL for an order
   * GET /tracking/{orderId}
   */
  async getTrackingUrl(orderId?: string, externalId?: string): Promise<string> {
    try {
      const identifier = orderId || externalId;
      const path = orderId ? `/tracking/${orderId}` : `/tracking/external/${externalId}`;
      
      console.log(`🔗 [SHIPPING-SERVICE] Getting tracking URL for: ${identifier}`);
      
      const response = await this.apiClient.get<{ trackingUrl: string }>(path);
      
      console.log(`✅ [SHIPPING-SERVICE] Tracking URL retrieved for: ${identifier}`);
      return response.data.trackingUrl;
    } catch (error: any) {
      console.error('❌ [SHIPPING-SERVICE] Error getting tracking URL:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Determine if using platform or external flow
   */
  isExternalFlow(orderId?: string, externalId?: string): boolean {
    return !orderId && !!externalId;
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update merchant ID (for multi-merchant support)
   */
  updateMerchantId(newMerchantId: string): void {
    this.merchantId = newMerchantId;
    console.log(`🔄 [SHIPPING-SERVICE] Updated merchant ID to: ${newMerchantId}`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to get events without processing
      await this.apiClient.get('/events/polling');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopPolling();
    this.processedEvents.clear();
  }
}

// ==================== EXPORT ====================

export default IFoodShippingService;