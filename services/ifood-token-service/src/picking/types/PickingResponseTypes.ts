/**
 * Picking Module Response Types
 * 
 * Tipos para respostas da API de picking do iFood
 */

export interface PickingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: PickingApiError;
  timestamp: Date;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface PickingApiError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  retryAfter?: number;
  validationErrors?: PickingValidationError[];
}

export interface PickingValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface StartSeparationResponse {
  orderId: string;
  separationId: string;
  status: 'IN_PROGRESS' | 'STARTED' | 'READY';
  allowedOperations: string[];
  currentItems?: PickingItemSummary[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface ItemOperationResponse {
  uniqueId: string;
  operation: 'ADDED' | 'UPDATED' | 'REMOVED' | 'REPLACED';
  status: 'SUCCESS' | 'FAILED' | 'PENDING_VALIDATION';
  validationErrors?: PickingValidationError[];
  item?: PickingItemSummary;
  previousItem?: PickingItemSummary;
  warnings?: string[];
}

export interface EndSeparationResponse {
  orderId: string;
  separationId: string;
  status: 'COMPLETED' | 'FAILED' | 'REQUIRES_VALIDATION';
  finalOrderValue?: number;
  originalOrderValue?: number;
  modificationsApplied: boolean;
  modificationsSummary?: PickingModificationSummary;
  validationResults?: PickingResponseValidationResult[];
  nextSteps?: string[];
}

export interface PickingItemSummary {
  uniqueId: string;
  product_id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight?: number;
  unit?: string;
  status: 'AVAILABLE' | 'MODIFIED' | 'SUBSTITUTED' | 'REMOVED';
  modifications?: string[];
}

export interface PickingModificationSummary {
  totalModifications: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  itemsSubstituted: number;
  priceImpact: number;
  weightAdjustments?: number;
}

export interface PickingResponseValidationResult {
  valid: boolean;
  warnings: string[];
  errors: PickingValidationError[];
  affectedItems: string[];
}

export interface PickingSeparationListResponse {
  separations: Array<{
    orderId: string;
    separationId: string;
    status: string;
    startedAt: Date;
    lastActivity: Date;
    itemsCount: number;
    modificationsCount: number;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

// Respostas de erro específicas do iFood
export interface IfoodPickingErrorResponse {
  code: string;
  message: string;
  correlationId?: string;
  timestamp: string;
  path: string;
  details?: {
    orderId?: string;
    separationId?: string;
    itemId?: string;
    validationFailures?: Array<{
      field: string;
      rejectedValue: any;
      message: string;
    }>;
  };
}