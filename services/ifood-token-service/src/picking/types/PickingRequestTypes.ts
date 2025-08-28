/**
 * Picking Module Request Types
 * 
 * Tipos para requisições da API de picking do iFood
 * Baseado na estrutura real fornecida com flexibilidade para campos adicionais
 */

export interface StartSeparationRequest {
  orderId: string;
  userId?: string;
  notes?: string;
  // Campos adicionais flexíveis para futuras extensões
  [key: string]: any;
}

export interface AddItemRequest {
  quantity: number;
  product_id: string;
  replacedUniqueId?: string;
  notes?: string;
  substitution_reason?: string;
  weight?: number;
  unit?: string;
  price_override?: number;
  // Campos flexíveis para extensibilidade
  [key: string]: any;
}

export interface UpdateItemRequest {
  quantity?: number;
  product_id?: string;
  replacedUniqueId?: string;
  notes?: string;
  substitution_reason?: string;
  weight?: number;
  unit?: string;
  price_override?: number;
  // Campos flexíveis para extensibilidade
  [key: string]: any;
}

export interface RemoveItemRequest {
  reason?: string;
  notes?: string;
  // Campos flexíveis
  [key: string]: any;
}

export interface EndSeparationRequest {
  orderId: string;
  separationId?: string;
  finalValidation?: boolean;
  notes?: string;
  finalItems?: any[];
  // Campos adicionais flexíveis
  [key: string]: any;
}

export interface PickingBulkOperationRequest {
  operations: Array<{
    type: 'ADD' | 'UPDATE' | 'REMOVE';
    uniqueId?: string;
    data: AddItemRequest | UpdateItemRequest | RemoveItemRequest;
  }>;
  orderId: string;
  validateAll?: boolean;
}

// Headers obrigatórios para todas as requisições
export interface PickingRequestHeaders {
  'Authorization': string;
  'Content-Type': 'application/json';
  'x-merchant-id': string;
  'x-request-id'?: string;
  'x-user-id'?: string;
}

// Parâmetros de URL comuns
export interface PickingUrlParams {
  orderId: string;
  uniqueId?: string;
  merchantId?: string;
}