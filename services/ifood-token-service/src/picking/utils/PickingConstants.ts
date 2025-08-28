/**
 * Picking Module Constants
 * 
 * Constantes utilizadas em todo o módulo de picking
 */

export const PICKING_CONSTANTS = {
  // URLs da API iFood CORRIGIDAS
  API: {
    BASE_URL: 'https://merchant-api.ifood.com.br/picking/v1.0',
    ENDPOINTS: {
      START_SEPARATION: '/orders/{orderId}/startSeparation',
      ADD_ITEM: '/orders/{orderId}/items', 
      UPDATE_ITEM: '/orders/{orderId}/items/{uniqueId}',
      REMOVE_ITEM: '/orders/{orderId}/items/{uniqueId}',
      END_SEPARATION: '/endSeparation',
    }
  },

  // Status de separação
  SEPARATION_STATUS: {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
  } as const,

  // Tipos de operação
  OPERATION_TYPES: {
    START_SEPARATION: 'START_SEPARATION',
    ADD_ITEM: 'ADD_ITEM',
    UPDATE_ITEM: 'UPDATE_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    END_SEPARATION: 'END_SEPARATION'
  } as const,

  // Status de operação
  OPERATION_STATUS: {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
  } as const,

  // Ações de modificação de item
  ITEM_ACTIONS: {
    ADDED: 'ADDED',
    UPDATED: 'UPDATED',
    REMOVED: 'REMOVED',
    REPLACED: 'REPLACED'
  } as const,

  // Códigos de erro comuns
  ERROR_CODES: {
    INVALID_ORDER_ID: 'INVALID_ORDER_ID',
    SEPARATION_NOT_STARTED: 'SEPARATION_NOT_STARTED',
    SEPARATION_ALREADY_STARTED: 'SEPARATION_ALREADY_STARTED',
    SEPARATION_ALREADY_COMPLETED: 'SEPARATION_ALREADY_COMPLETED',
    PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
    INVALID_PRODUCT_ID: 'INVALID_PRODUCT_ID',
    INVALID_QUANTITY: 'INVALID_QUANTITY',
    ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVER_ERROR: 'SERVER_ERROR'
  } as const,

  // Timeouts e limites
  LIMITS: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    REQUEST_TIMEOUT_MS: 30000,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutos
    MAX_ITEMS_PER_REQUEST: 50,
    MAX_QUANTITY_PER_ITEM: 9999
  },

  // Headers obrigatórios
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    MERCHANT_ID: 'x-merchant-id',
    REQUEST_ID: 'x-request-id',
    USER_ID: 'x-user-id'
  } as const,

  // Valores padrão
  DEFAULTS: {
    CONTENT_TYPE: 'application/json',
    PAGE_SIZE: 20,
    SORT_ORDER: 'desc'
  } as const,

  // Mensagens de log
  LOG_MESSAGES: {
    SEPARATION_STARTED: 'Picking separation started',
    SEPARATION_COMPLETED: 'Picking separation completed',
    SEPARATION_FAILED: 'Picking separation failed',
    ITEM_ADDED: 'Item added to order',
    ITEM_UPDATED: 'Item updated in order',
    ITEM_REMOVED: 'Item removed from order',
    VALIDATION_ERROR: 'Validation error occurred',
    API_ERROR: 'API error occurred',
    NETWORK_ERROR: 'Network error occurred'
  } as const
};

// Tipo para status de separação
export type SeparationStatus = typeof PICKING_CONSTANTS.SEPARATION_STATUS[keyof typeof PICKING_CONSTANTS.SEPARATION_STATUS];

// Tipo para tipos de operação
export type OperationType = typeof PICKING_CONSTANTS.OPERATION_TYPES[keyof typeof PICKING_CONSTANTS.OPERATION_TYPES];

// Tipo para status de operação
export type OperationStatus = typeof PICKING_CONSTANTS.OPERATION_STATUS[keyof typeof PICKING_CONSTANTS.OPERATION_STATUS];

// Tipo para ações de item
export type ItemAction = typeof PICKING_CONSTANTS.ITEM_ACTIONS[keyof typeof PICKING_CONSTANTS.ITEM_ACTIONS];

// Tipo para códigos de erro
export type ErrorCode = typeof PICKING_CONSTANTS.ERROR_CODES[keyof typeof PICKING_CONSTANTS.ERROR_CODES];