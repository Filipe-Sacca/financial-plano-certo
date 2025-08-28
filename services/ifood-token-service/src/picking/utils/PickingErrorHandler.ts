/**
 * Picking Error Handler - Centraliza tratamento de erros
 */

import { PickingError, PickingApiError } from '../types';
import { PICKING_CONSTANTS } from './PickingConstants';

export class PickingErrorHandler {
  /**
   * Converte PickingApiError para PickingError
   */
  static convertApiError(apiError: PickingApiError): PickingError {
    return {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      retryable: apiError.retryable || false
    };
  }

  /**
   * Cria PickingError padrão
   */
  static createError(
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
   * Determina se um erro é recuperável
   */
  static isRetryableError(error: PickingError | PickingApiError): boolean {
    if ('retryable' in error && error.retryable !== undefined) {
      return error.retryable;
    }
    
    const retryableCodes = [
      PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
      PICKING_CONSTANTS.ERROR_CODES.SERVER_ERROR,
      PICKING_CONSTANTS.ERROR_CODES.RATE_LIMIT_EXCEEDED
    ];
    
    return retryableCodes.includes(error.code as any);
  }
}