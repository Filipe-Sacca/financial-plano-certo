/**
 * Picking Module Helper Functions
 * 
 * Funções utilitárias para o módulo de picking
 */

import { PICKING_CONSTANTS } from './PickingConstants';
import type { PickingError, PickingApiError } from '../types';

export class PickingHelpers {
  /**
   * Constrói URL completa do endpoint
   */
  static buildEndpointUrl(endpoint: string, params: Record<string, string> = {}): string {
    let url = `${PICKING_CONSTANTS.API.BASE_URL}${endpoint}`;
    
    // Substituir parâmetros na URL
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    
    return url;
  }

  /**
   * Gera headers obrigatórios para requisições
   */
  static generateHeaders(token: string, merchantId: string, additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      [PICKING_CONSTANTS.HEADERS.AUTHORIZATION]: `Bearer ${token}`,
      [PICKING_CONSTANTS.HEADERS.CONTENT_TYPE]: PICKING_CONSTANTS.DEFAULTS.CONTENT_TYPE,
      [PICKING_CONSTANTS.HEADERS.MERCHANT_ID]: merchantId,
      ...additionalHeaders
    };
  }

  /**
   * Gera ID único para requisição
   */
  static generateRequestId(): string {
    return `picking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Valida se orderId é válido
   */
  static validateOrderId(orderId: string): boolean {
    return typeof orderId === 'string' && orderId.trim().length > 0;
  }

  /**
   * Valida se product_id é válido
   */
  static validateProductId(productId: string): boolean {
    return typeof productId === 'string' && productId.trim().length > 0;
  }

  /**
   * Valida se quantity é válida
   */
  static validateQuantity(quantity: number): boolean {
    return typeof quantity === 'number' && 
           quantity >= 0 && 
           quantity <= PICKING_CONSTANTS.LIMITS.MAX_QUANTITY_PER_ITEM &&
           Number.isInteger(quantity);
  }

  /**
   * Valida se uniqueId é válido (formato UUID)
   */
  static validateUniqueId(uniqueId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uniqueId === 'string' && uuidRegex.test(uniqueId);
  }

  /**
   * Sanitiza dados de entrada removendo campos vazios
   */
  static sanitizeRequestData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          sanitized[key] = this.sanitizeRequestData(value);
        }
      });
      return sanitized;
    }
    
    return data;
  }

  /**
   * Converte erro HTTP em PickingError
   */
  static createPickingError(
    code: string, 
    message: string, 
    details?: any, 
    retryable: boolean = false
  ): PickingError {
    return {
      code,
      message,
      details,
      retryable
    };
  }

  /**
   * Converte resposta de erro da API iFood em PickingApiError
   */
  static parseIfoodError(errorResponse: any): PickingApiError {
    const retryable = this.isRetryableError(errorResponse.code);
    return {
      code: errorResponse.code || 'UNKNOWN_ERROR',
      message: errorResponse.message || 'Erro desconhecido na API do iFood',
      details: errorResponse.details || errorResponse,
      retryable,
      validationErrors: errorResponse.validationErrors || []
    };
  }

  /**
   * Determina se um erro é recuperável (retry)
   */
  static isRetryableError(errorCode?: string): boolean {
    const retryableCodes = [
      PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
      PICKING_CONSTANTS.ERROR_CODES.SERVER_ERROR,
      PICKING_CONSTANTS.ERROR_CODES.RATE_LIMIT_EXCEEDED
    ];
    
    return errorCode ? retryableCodes.includes(errorCode as any) : false;
  }

  /**
   * Implementa delay exponencial para retry
   */
  static async exponentialBackoff(attempt: number, baseDelay: number = PICKING_CONSTANTS.LIMITS.RETRY_DELAY_MS): Promise<void> {
    const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Formata timestamp para logs
   */
  static formatTimestamp(date: Date = new Date()): string {
    return date.toISOString();
  }

  /**
   * Gera resumo de operação para logs
   */
  static generateOperationSummary(operation: string, orderId: string, details?: any): string {
    const timestamp = this.formatTimestamp();
    const summary = `[${timestamp}] ${operation} - Order: ${orderId}`;
    
    if (details) {
      return `${summary} - Details: ${JSON.stringify(details)}`;
    }
    
    return summary;
  }

  /**
   * Valida se token não está expirado (margem de 5 minutos)
   */
  static isTokenExpiring(tokenExpiresAt: Date, marginMinutes: number = 5): boolean {
    const now = new Date();
    const margin = marginMinutes * 60 * 1000; // Convert to milliseconds
    return tokenExpiresAt.getTime() - now.getTime() <= margin;
  }

  /**
   * Extrai informações do token JWT (básico, sem verificação)
   */
  static parseJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}