/**
 * PickingValidationService - Sistema de Validações do Módulo de Picking
 * 
 * Responsável por validar dados e regras de negócio antes de enviar para API
 */

import type { 
  PickingValidationResult, 
  AddItemRequest, 
  UpdateItemRequest,
  PickingValidationError,
  PickingError
} from '../types';
import { PICKING_CONSTANTS } from '../utils/PickingConstants';
import { PickingHelpers } from '../utils/PickingHelpers';

export class PickingValidationService {
  private merchantId: string;
  private catalogService?: any; // Será injetado para validar product_id

  constructor(merchantId: string, catalogService?: any) {
    this.merchantId = merchantId;
    this.catalogService = catalogService;
  }

  /**
   * Valida dados para iniciar separação
   */
  validateStartSeparation(orderId: string): PickingValidationResult {
    const errors: PickingValidationError[] = [];
    const warnings: string[] = [];

    // Validar orderId
    if (!PickingHelpers.validateOrderId(orderId)) {
      errors.push({
        field: 'orderId',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_ORDER_ID,
        message: 'Order ID é obrigatório e deve ser uma string não vazia',
        value: orderId
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      affectedItems: []
    };
  }

  /**
   * Valida dados para adicionar item
   */
  async validateAddItem(itemData: AddItemRequest): Promise<PickingValidationResult> {
    const errors: PickingValidationError[] = [];
    const warnings: string[] = [];

    // Validar product_id
    if (!itemData.product_id) {
      errors.push({
        field: 'product_id',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_PRODUCT_ID,
        message: 'product_id é obrigatório',
        value: itemData.product_id
      });
    } else if (!PickingHelpers.validateProductId(itemData.product_id)) {
      errors.push({
        field: 'product_id',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_PRODUCT_ID,
        message: 'product_id deve ser uma string não vazia',
        value: itemData.product_id
      });
    } else {
      // Validar se produto existe no catálogo
      try {
        const productExists = await this.validateProductExists(itemData.product_id);
        if (!productExists) {
          errors.push({
            field: 'product_id',
            code: PICKING_CONSTANTS.ERROR_CODES.PRODUCT_NOT_FOUND,
            message: 'Produto não encontrado no catálogo da loja',
            value: itemData.product_id
          });
        }
      } catch (error) {
        warnings.push('Não foi possível validar se o produto existe no catálogo');
      }
    }

    // Validar quantity
    if (itemData.quantity === undefined || itemData.quantity === null) {
      errors.push({
        field: 'quantity',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_QUANTITY,
        message: 'quantity é obrigatória',
        value: itemData.quantity
      });
    } else if (!PickingHelpers.validateQuantity(itemData.quantity)) {
      errors.push({
        field: 'quantity',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_QUANTITY,
        message: `quantity deve ser um número inteiro entre 0 e ${PICKING_CONSTANTS.LIMITS.MAX_QUANTITY_PER_ITEM}`,
        value: itemData.quantity
      });
    }

    // Validar replacedUniqueId se fornecido
    if (itemData.replacedUniqueId && !PickingHelpers.validateUniqueId(itemData.replacedUniqueId)) {
      errors.push({
        field: 'replacedUniqueId',
        code: PICKING_CONSTANTS.ERROR_CODES.ITEM_NOT_FOUND,
        message: 'replacedUniqueId deve ser um UUID válido se fornecido',
        value: itemData.replacedUniqueId
      });
    }

    // Validar campos opcionais
    if (itemData.weight !== undefined) {
      if (typeof itemData.weight !== 'number' || itemData.weight < 0) {
        errors.push({
          field: 'weight',
          code: 'INVALID_WEIGHT',
          message: 'weight deve ser um número positivo',
          value: itemData.weight
        });
      }
    }

    if (itemData.price_override !== undefined) {
      if (typeof itemData.price_override !== 'number' || itemData.price_override < 0) {
        errors.push({
          field: 'price_override',
          code: 'INVALID_PRICE',
          message: 'price_override deve ser um número positivo',
          value: itemData.price_override
        });
      }
    }

    // Warnings para substituições
    if (itemData.replacedUniqueId && !itemData.substitution_reason) {
      warnings.push('É recomendado fornecer substitution_reason ao substituir um item');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      affectedItems: [itemData.product_id]
    };
  }

  /**
   * Valida dados para atualizar item
   */
  async validateUpdateItem(uniqueId: string, updates: UpdateItemRequest): Promise<PickingValidationResult> {
    const errors: PickingValidationError[] = [];
    const warnings: string[] = [];

    // Validar uniqueId
    if (!PickingHelpers.validateUniqueId(uniqueId)) {
      errors.push({
        field: 'uniqueId',
        code: PICKING_CONSTANTS.ERROR_CODES.ITEM_NOT_FOUND,
        message: 'uniqueId deve ser um UUID válido',
        value: uniqueId
      });
    }

    // Validar se pelo menos um campo foi fornecido para atualização
    const updateFields = Object.keys(updates).filter(key => updates[key as keyof UpdateItemRequest] !== undefined);
    if (updateFields.length === 0) {
      errors.push({
        field: 'updates',
        code: 'NO_UPDATES_PROVIDED',
        message: 'Pelo menos um campo deve ser fornecido para atualização',
        value: updates
      });
    }

    // Validar product_id se fornecido
    if (updates.product_id !== undefined) {
      if (!PickingHelpers.validateProductId(updates.product_id)) {
        errors.push({
          field: 'product_id',
          code: PICKING_CONSTANTS.ERROR_CODES.INVALID_PRODUCT_ID,
          message: 'product_id deve ser uma string não vazia se fornecido',
          value: updates.product_id
        });
      } else {
        try {
          const productExists = await this.validateProductExists(updates.product_id);
          if (!productExists) {
            errors.push({
              field: 'product_id',
              code: PICKING_CONSTANTS.ERROR_CODES.PRODUCT_NOT_FOUND,
              message: 'Produto não encontrado no catálogo da loja',
              value: updates.product_id
            });
          }
        } catch (error) {
          warnings.push('Não foi possível validar se o produto existe no catálogo');
        }
      }
    }

    // Validar quantity se fornecido
    if (updates.quantity !== undefined && !PickingHelpers.validateQuantity(updates.quantity)) {
      errors.push({
        field: 'quantity',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_QUANTITY,
        message: `quantity deve ser um número inteiro entre 0 e ${PICKING_CONSTANTS.LIMITS.MAX_QUANTITY_PER_ITEM}`,
        value: updates.quantity
      });
    }

    // Validar replacedUniqueId se fornecido
    if (updates.replacedUniqueId && !PickingHelpers.validateUniqueId(updates.replacedUniqueId)) {
      errors.push({
        field: 'replacedUniqueId',
        code: PICKING_CONSTANTS.ERROR_CODES.ITEM_NOT_FOUND,
        message: 'replacedUniqueId deve ser um UUID válido se fornecido',
        value: updates.replacedUniqueId
      });
    }

    // Validar campos opcionais similares ao addItem
    if (updates.weight !== undefined && (typeof updates.weight !== 'number' || updates.weight < 0)) {
      errors.push({
        field: 'weight',
        code: 'INVALID_WEIGHT',
        message: 'weight deve ser um número positivo',
        value: updates.weight
      });
    }

    if (updates.price_override !== undefined && (typeof updates.price_override !== 'number' || updates.price_override < 0)) {
      errors.push({
        field: 'price_override',
        code: 'INVALID_PRICE',
        message: 'price_override deve ser um número positivo',
        value: updates.price_override
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      affectedItems: updates.product_id ? [updates.product_id] : []
    };
  }

  /**
   * Valida dados para remover item
   */
  validateRemoveItem(uniqueId: string): PickingValidationResult {
    const errors: PickingValidationError[] = [];
    const warnings: string[] = [];

    // Validar uniqueId
    if (!PickingHelpers.validateUniqueId(uniqueId)) {
      errors.push({
        field: 'uniqueId',
        code: PICKING_CONSTANTS.ERROR_CODES.ITEM_NOT_FOUND,
        message: 'uniqueId deve ser um UUID válido',
        value: uniqueId
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      affectedItems: [uniqueId]
    };
  }

  /**
   * Valida dados para finalizar separação
   */
  validateEndSeparation(orderId: string): PickingValidationResult {
    const errors: PickingValidationError[] = [];
    const warnings: string[] = [];

    // Validar orderId
    if (!PickingHelpers.validateOrderId(orderId)) {
      errors.push({
        field: 'orderId',
        code: PICKING_CONSTANTS.ERROR_CODES.INVALID_ORDER_ID,
        message: 'Order ID é obrigatório e deve ser uma string não vazia',
        value: orderId
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      affectedItems: []
    };
  }

  /**
   * Validação em lote para múltiplas operações
   */
  async validateBulkOperations(operations: Array<{type: string, data: any}>): Promise<PickingValidationResult> {
    const allErrors: PickingValidationError[] = [];
    const allWarnings: string[] = [];
    const affectedItems: string[] = [];

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      let validation: PickingValidationResult;

      switch (operation.type) {
        case 'ADD':
          validation = await this.validateAddItem(operation.data);
          break;
        case 'UPDATE':
          validation = await this.validateUpdateItem(operation.data.uniqueId, operation.data.updates);
          break;
        case 'REMOVE':
          validation = await this.validateRemoveItem(operation.data.uniqueId);
          break;
        default:
          validation = {
            valid: false,
            errors: [{
              field: 'type',
              code: 'INVALID_OPERATION_TYPE',
              message: `Tipo de operação inválido: ${operation.type}`,
              value: operation.type
            }],
            warnings: [],
            affectedItems: []
          };
      }

      // Adicionar índice da operação aos erros
      validation.errors.forEach(error => {
        allErrors.push({
          ...error,
          field: `operations[${i}].${error.field}`
        });
      });

      validation.warnings.forEach(warning => {
        allWarnings.push(`Operação ${i}: ${warning}`);
      });

      affectedItems.push(...validation.affectedItems);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      affectedItems: [...new Set(affectedItems)] // Remove duplicatas
    };
  }

  /**
   * Valida se produto existe no catálogo
   */
  private async validateProductExists(productId: string): Promise<boolean> {
    if (!this.catalogService) {
      console.warn('CatalogService não configurado - pulando validação de produto');
      return true; // Assume válido se serviço não estiver disponível
    }

    try {
      // Integrar com serviço de catálogo existente
      const product = await this.catalogService.getProductById(productId);
      
      if (!product) {
        return false;
      }

      // Verificar se produto está ativo
      if (product.status !== 'AVAILABLE') {
        console.warn(`Produto ${productId} existe mas não está disponível (status: ${product.status})`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Erro ao validar produto ${productId}:`, error);
      throw error; // Propagar erro para tratamento upstream
    }
  }

  /**
   * Validações de regras de negócio específicas
   */
  validateBusinessRules(operation: string, data: any): PickingValidationResult {
    const errors: PickingValidationError[] = [];
    const warnings: string[] = [];

    // Regra: Não permitir quantidade zero em adições (só em atualizações para remoção efetiva)
    if (operation === 'ADD' && data.quantity === 0) {
      warnings.push('Adicionar item com quantidade 0 - considere usar operação de remoção');
    }

    // Regra: Avisar sobre substituições sem motivo
    if ((operation === 'ADD' || operation === 'UPDATE') && data.replacedUniqueId && !data.substitution_reason) {
      warnings.push('Substituição sem motivo especificado - recomendado para auditoria');
    }

    // Regra: Validar peso vs quantidade para produtos pesáveis
    if ((operation === 'ADD' || operation === 'UPDATE') && data.weight && data.quantity) {
      if (data.weight > 0 && data.quantity !== 1) {
        warnings.push('Produto com peso específico deveria ter quantidade = 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      affectedItems: []
    };
  }

  /**
   * Configurar serviço de catálogo para validações
   */
  setCatalogService(catalogService: any): void {
    this.catalogService = catalogService;
  }
}