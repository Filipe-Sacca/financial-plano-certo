/**
 * Picking Module Types - Core Interfaces
 * 
 * Tipos principais para o módulo de picking do iFood
 * Permite gestão de separação de pedidos com flexibilidade para campos adicionais
 */

export interface PickingSeparationStatus {
  orderId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  separationId?: string;
  startedAt?: Date;
  completedAt?: Date;
  modifiedItems: PickingModifiedItem[];
  metadata?: Record<string, any>;
}

export interface PickingModifiedItem {
  uniqueId: string;
  action: 'ADDED' | 'UPDATED' | 'REMOVED' | 'REPLACED';
  originalItem?: PickingItemData;
  newItem?: PickingItemData;
  timestamp: Date;
  reason?: string;
  userId?: string;
}

export interface PickingItemData {
  uniqueId: string;
  product_id: string;
  quantity: number;
  name?: string;
  price?: number;
  originalPrice?: number;
  weight?: number;
  unit?: string;
  replacedUniqueId?: string;
  notes?: string;
  substitution_reason?: string;
  actual_weight?: number;
  original_weight?: number;
  // Campos flexíveis para extensibilidade
  [key: string]: any;
}

export interface PickingSession {
  sessionId: string;
  orderId: string;
  merchantId: string;
  status: PickingSeparationStatus['status'];
  startedAt: Date;
  lastActivity: Date;
  userId?: string;
  operations: PickingOperation[];
}

export interface PickingOperation {
  operationId: string;
  type: 'START_SEPARATION' | 'ADD_ITEM' | 'UPDATE_ITEM' | 'REMOVE_ITEM' | 'END_SEPARATION';
  timestamp: Date;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  data?: any;
  error?: PickingError;
}

export interface PickingError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  field?: string;
  value?: any;
}

export interface PickingValidationResult {
  valid: boolean;
  errors: PickingError[];
  warnings: string[];
  affectedItems: string[];
}

export interface PickingMetrics {
  totalSeparations: number;
  successfulSeparations: number;
  failedSeparations: number;
  averageSeparationTime: number;
  itemsModified: number;
  substitutions: number;
}