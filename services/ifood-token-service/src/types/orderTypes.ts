/**
 * TypeScript interfaces for iFood Orders Module
 * Created: 18/08/2025
 * Purpose: Type definitions for orders, events, polling and acknowledgment
 */

// ====================================================================
// CORE ORDER TYPES
// ====================================================================

export interface IFoodOrder {
  id: string;
  merchantId: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  payments: OrderPayment[];
  delivery: OrderDelivery;
  total: OrderTotal;
  createdAt: string;
  lastUpdate: string;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'DISPATCHED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface OrderCustomer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  document?: string;
  address: OrderAddress;
}

export interface OrderAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  reference?: string;
}

export interface OrderItem {
  id: string;
  externalId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observations?: string;
  options?: OrderItemOption[];
}

export interface OrderItemOption {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  value: number;
  currency: string;
  prepaid: boolean;
  changeFor?: number;
}

export type PaymentMethod = 
  | 'CREDIT' 
  | 'DEBIT' 
  | 'MEAL_VOUCHER' 
  | 'FOOD_VOUCHER' 
  | 'CASH' 
  | 'PIX' 
  | 'DIGITAL_WALLET';

export interface OrderDelivery {
  mode: DeliveryMode;
  deliveredBy?: DeliveredBy;
  estimatedDeliveryTime?: string;
  deliveryAddress?: OrderAddress;
  deliveryFee: number;
  observations?: string;
}

export type DeliveryMode = 'DELIVERY' | 'TAKEOUT' | 'INDOOR';
export type DeliveredBy = 'MERCHANT' | 'IFOOD';

export interface OrderTotal {
  subTotal: number;
  deliveryFee: number;
  benefits: number;
  total: number;
}

// ====================================================================
// POLLING TYPES
// ====================================================================

export interface PollingRequest {
  merchantIds?: string[]; // For x-polling-merchants header
  accessToken: string;
  userId: string;
}

export interface PollingResponse {
  events: PollingEvent[];
  hasMore?: boolean;
  nextPollingTime?: string;
}

export interface PollingEvent {
  id: string;
  type: EventType;
  merchantId: string;
  data: any;
  timestamp: string;
  metadata?: EventMetadata;
}

export type EventType = 
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED' 
  | 'ORDER_CANCELLED'
  | 'ORDER_READY'
  | 'ORDER_DISPATCHED'
  | 'ORDER_DELIVERED'
  | 'CATALOG_UPDATED'
  | 'MERCHANT_STATUS_CHANGED'
  | 'INTERRUPTION_CREATED'
  | 'INTERRUPTION_REMOVED';

export interface EventMetadata {
  source: string;
  version: string;
  correlationId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ====================================================================
// ACKNOWLEDGMENT TYPES
// ====================================================================

export interface AcknowledgmentRequest {
  eventIds: string[];
  batchId?: string;
  userId: string;
  accessToken: string;
}

export interface AcknowledgmentResponse {
  success: boolean;
  processedCount: number;
  successfulCount: number;
  failedCount: number;
  failedEventIds?: string[];
  batchId: string;
  processingTimeMs: number;
  message?: string;
  errors?: AcknowledgmentError[];
}

export interface AcknowledgmentError {
  eventId: string;
  errorCode: string;
  errorMessage: string;
  retryable: boolean;
}

export interface AcknowledgmentBatch {
  id: string;
  eventIds: string[];
  userId: string;
  maxRetries: number;
  currentAttempt: number;
  status: BatchStatus;
  createdAt: string;
  nextRetryAt?: string;
}

export type BatchStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'RETRYING';

// ====================================================================
// VIRTUAL BAG TYPES
// ====================================================================

export interface VirtualBagRequest {
  orderId: string;
  merchantId: string;
  orderData: IFoodOrder;
  userId: string;
  source: 'POLLING' | 'WEBHOOK' | 'MANUAL';
}

export interface VirtualBagResponse {
  success: boolean;
  orderId: string;
  internalOrderId?: string;
  status: string;
  processingTimeMs: number;
  message?: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  severity: 'WARNING' | 'ERROR';
}

// ====================================================================
// SERVICE CONFIGURATION TYPES
// ====================================================================

export interface OrderServiceConfig {
  // Polling Configuration
  pollingIntervalMs: number;
  pollingTimeoutMs: number;
  maxEventsPerPoll: number;
  
  // Acknowledgment Configuration
  maxEventsPerAcknowledgment: number;
  acknowledgmentRetryAttempts: number;
  acknowledgmentRetryDelayMs: number;
  acknowledgmentTimeoutMs: number;
  
  // Processing Configuration
  batchProcessingSize: number;
  maxConcurrentBatches: number;
  processingTimeoutMs: number;
  
  // Performance Configuration
  enablePerformanceMonitoring: boolean;
  logDetailedMetrics: boolean;
  enableMemoryMonitoring: boolean;
  
  // Error Handling
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
  retryBackoffMultiplier: number;
  
  // Security
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  enableTokenRefresh: boolean;
}

// ====================================================================
// DATABASE ENTITY TYPES
// ====================================================================

export interface OrderEntity {
  id: string;
  ifood_order_id: string;
  merchant_id: string;
  user_id: string; // UUID as string in TypeScript
  status: OrderStatus;
  order_data: any;
  virtual_bag_data?: any;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: any;
  total_amount?: number;
  delivery_fee?: number;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: 'CUSTOMER' | 'IFOOD' | 'MERCHANT';
}

export interface EventEntity {
  id: string;
  event_id: string;
  user_id: string; // UUID as string in TypeScript
  merchant_id?: string;
  event_type: EventType;
  event_category?: string;
  event_data: any;
  raw_response?: any;
  polling_batch_id?: string;
  received_at: string;
  acknowledged_at?: string;
  acknowledgment_attempts: number;
  acknowledgment_success: boolean;
  acknowledgment_response?: any;
  processed_at?: string;
  processing_status: ProcessingStatus;
  processing_error?: string;
  processing_attempts: number;
  created_at: string;
  updated_at: string;
}

export type ProcessingStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'SKIPPED';

export interface PollingLogEntity {
  id: string;
  user_id: string; // UUID as string in TypeScript
  polling_timestamp: string;
  polling_duration_ms?: number;
  events_received: number;
  events_processed: number;
  events_acknowledged: number;
  events_failed: number;
  api_response_time_ms?: number;
  api_status_code?: number;
  api_error_message?: string;
  success: boolean;
  error_message?: string;
  error_details?: any;
  request_headers?: any;
  response_headers?: any;
  merchant_filter?: string;
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
  started_at: string;
  completed_at?: string;
  next_polling_at?: string;
}

// ====================================================================
// API RESPONSE TYPES (iFood Official)
// ====================================================================

export interface IFoodPollingApiResponse {
  events: IFoodEventApiResponse[];
  hasMore?: boolean;
}

export interface IFoodEventApiResponse {
  id: string;
  type: string;
  createdAt: string;
  merchantId: string;
  orderId?: string;
  data: any;
}

export interface IFoodAcknowledgmentApiResponse {
  success: boolean;
  processedEvents: number;
  errors?: Array<{
    eventId: string;
    message: string;
  }>;
}

export interface IFoodVirtualBagApiResponse {
  orderId: string;
  status: string;
  message?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

// ====================================================================
// SERVICE RESULT TYPES
// ====================================================================

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  metadata?: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
  };
}

export interface PollingResult extends ServiceResult {
  data?: {
    eventsReceived: number;
    eventsProcessed: number;
    eventsAcknowledged: number;
    pollingDurationMs: number;
    nextPollingAt: string;
  };
}

export interface AcknowledgmentResult extends ServiceResult {
  data?: {
    batchId: string;
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    processingTimeMs: number;
  };
}

export interface VirtualBagResult extends ServiceResult {
  data?: {
    orderId: string;
    internalOrderId: string;
    status: OrderStatus;
    processingTimeMs: number;
  };
}

// ====================================================================
// UTILITY TYPES
// ====================================================================

export interface TimingMetrics {
  startTime: number;
  endTime?: number;
  durationMs?: number;
  targetIntervalMs: number;
  driftMs?: number;
  accuracy?: number; // Percentage accuracy (0-100)
}

export interface HealthStatus {
  service: string;
  status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'OFFLINE';
  lastPolling?: string;
  successRate24h?: number;
  avgResponseTimeMs?: number;
  eventsToday?: number;
  uptime?: number;
  issues?: string[];
}

export interface PerformanceMetrics {
  pollingAccuracy: number; // Percentage
  acknowledgmentRate: number; // Percentage  
  avgApiResponseTime: number; // Milliseconds
  avgProcessingTime: number; // Milliseconds
  errorRate: number; // Percentage
  throughputEventsPerHour: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
}

// ====================================================================
// ERROR TYPES
// ====================================================================

export interface OrderServiceError extends Error {
  code: ErrorCode;
  details?: any;
  retryable: boolean;
  timestamp: string;
}

export type ErrorCode = 
  | 'POLLING_TIMEOUT'
  | 'POLLING_INTERVAL_DRIFT'
  | 'ACKNOWLEDGMENT_FAILED'
  | 'VIRTUAL_BAG_IMPORT_FAILED'
  | 'TOKEN_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'CONFIGURATION_ERROR';

// ====================================================================
// REQUEST/RESPONSE INTERFACES FOR OUR API ENDPOINTS
// ====================================================================

export interface StartPollingRequest {
  userId: string;
  merchantIds?: string[];
  intervalSeconds?: number;
}

export interface StartPollingResponse {
  success: boolean;
  message: string;
  config: {
    intervalSeconds: number;
    merchantIds: string[];
    nextPollingAt: string;
  };
}

export interface StopPollingRequest {
  userId: string;
}

export interface StopPollingResponse {
  success: boolean;
  message: string;
  statistics: {
    totalPolls: number;
    totalEvents: number;
    successRate: number;
    lastPoll: string;
  };
}

export interface GetPollingStatusRequest {
  userId: string;
}

export interface GetPollingStatusResponse {
  success: boolean;
  status: HealthStatus;
  metrics: PerformanceMetrics;
  config: OrderServiceConfig;
}

// ====================================================================
// INTERNAL SERVICE TYPES
// ====================================================================

export interface PollingServiceState {
  isRunning: boolean;
  userId: string;
  intervalHandle?: NodeJS.Timeout;
  scheduleJob?: any; // node-schedule job
  config: OrderServiceConfig;
  metrics: PerformanceMetrics;
  lastPollingAt?: string;
  nextPollingAt?: string;
  consecutiveErrors: number;
  startedAt: string;
}

export interface EventProcessingQueue {
  id: string;
  events: PollingEvent[];
  userId: string;
  merchantId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
}

export interface AcknowledgmentQueue {
  id: string;
  eventIds: string[];
  userId: string;
  batchSize: number;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: BatchStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  scheduledAt?: string;
  processedAt?: string;
  error?: string;
  retryDelayMs: number;
}

// ====================================================================
// MONITORING AND ANALYTICS TYPES
// ====================================================================

export interface DashboardMetrics {
  overview: {
    totalOrders24h: number;
    totalRevenue24h: number;
    avgOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  };
  polling: {
    isActive: boolean;
    successRate24h: number;
    avgIntervalAccuracy: number;
    eventsReceivedToday: number;
    lastPollingAt: string;
    nextPollingAt: string;
  };
  acknowledgment: {
    successRate24h: number;
    avgProcessingTime: number;
    pendingAcknowledgments: number;
    failedAcknowledgments24h: number;
  };
  performance: {
    avgApiResponseTime: number;
    avgProcessingTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
  };
  health: {
    status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'OFFLINE';
    uptime: number;
    lastError?: string;
    issues: string[];
  };
}

export interface AlertConfig {
  enableAlerts: boolean;
  pollingFailureThreshold: number; // Minutes without successful polling
  acknowledgmentFailureThreshold: number; // Percentage of failures
  responseTimeThreshold: number; // Milliseconds
  errorRateThreshold: number; // Percentage
  memoryUsageThreshold: number; // MB
  webhookUrl?: string;
  emailNotifications?: string[];
}

// ====================================================================
// EXPORT ALL TYPES
// ====================================================================

export {
  // Re-export commonly used types for easier imports
  type OrderStatus as Status,
  type EventType as Event,
  type ProcessingStatus as Processing,
  type ErrorCode as Error,
};