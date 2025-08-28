/**
 * PickingService - Serviço Principal do Módulo de Picking
 * 
 * Implementa todos os 5 endpoints obrigatórios do módulo de picking do iFood:
 * 1. POST /picking/v1.0/orders/{orderId}/startSeparation
 * 2. POST /picking/v1.0/orders/{orderId}/items
 * 3. PATCH /picking/v1.0/orders/{orderId}/items/{uniqueId}
 * 4. DELETE /picking/v1.0/orders/{orderId}/items/{uniqueId}
 * 5. POST /picking/v1.0/endSeparation
 */

import { 
  StartSeparationRequest, 
  AddItemRequest, 
  UpdateItemRequest, 
  RemoveItemRequest, 
  EndSeparationRequest,
  PickingApiResponse,
  StartSeparationResponse,
  ItemOperationResponse,
  EndSeparationResponse,
  PickingSeparationStatus,
  PickingSession
} from '../types';
import { PICKING_CONSTANTS } from '../utils/PickingConstants';
import { PickingHelpers } from '../utils/PickingHelpers';

export class PickingService {
  private token: string;
  private merchantId: string;
  private activeSessions: Map<string, PickingSession> = new Map();

  constructor(token: string, merchantId: string) {
    this.token = token;
    this.merchantId = merchantId;
  }

  /**
   * 1. Iniciar separação de pedido
   * POST /picking/v1.0/orders/{orderId}/startSeparation
   */
  async startSeparation(orderId: string, requestData?: StartSeparationRequest): Promise<PickingApiResponse<StartSeparationResponse>> {
    try {
      // Validações básicas
      if (!PickingHelpers.validateOrderId(orderId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.INVALID_ORDER_ID,
            'Order ID inválido'
          ),
          timestamp: new Date()
        };
      }

      // Verificar se separação já está em andamento
      if (this.activeSessions.has(orderId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.SEPARATION_ALREADY_STARTED,
            'Separação já iniciada para este pedido',
            undefined,
            false
          ),
          timestamp: new Date()
        };
      }

      const requestId = PickingHelpers.generateRequestId();
      const url = PickingHelpers.buildEndpointUrl(
        PICKING_CONSTANTS.API.ENDPOINTS.START_SEPARATION,
        { orderId }
      );

      const headers = PickingHelpers.generateHeaders(this.token, this.merchantId, {
        [PICKING_CONSTANTS.HEADERS.REQUEST_ID]: requestId
      });

      console.log(`🚀 Iniciando separação - Order: ${orderId}, RequestId: ${requestId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(PickingHelpers.sanitizeRequestData(requestData || {}))
      });

      const responseData = await response.json();

      if (response.ok) {
        // Criar sessão ativa
        const session: PickingSession = {
          sessionId: requestId,
          orderId,
          merchantId: this.merchantId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          lastActivity: new Date(),
          userId: requestData?.userId,
          operations: [{
            operationId: requestId,
            type: 'START_SEPARATION',
            timestamp: new Date(),
            status: 'SUCCESS',
            data: requestData
          }]
        };

        this.activeSessions.set(orderId, session);

        console.log(`✅ Separação iniciada com sucesso - Order: ${orderId}`);
        
        return {
          success: true,
          data: {
            orderId,
            separationId: requestId,
            status: 'IN_PROGRESS',
            allowedOperations: ['ADD_ITEM', 'UPDATE_ITEM', 'REMOVE_ITEM', 'END_SEPARATION']
          },
          timestamp: new Date(),
          requestId
        };
      } else {
        console.error(`❌ Erro ao iniciar separação - Order: ${orderId}`, responseData);
        return {
          success: false,
          error: PickingHelpers.parseIfoodError(responseData),
          timestamp: new Date(),
          requestId
        };
      }
    } catch (error: any) {
      console.error(`🚨 Erro interno ao iniciar separação - Order: ${orderId}`, error);
      return {
        success: false,
        error: PickingHelpers.createPickingError(
          PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
          `Erro de rede: ${error.message}`,
          error,
          true
        ),
        timestamp: new Date()
      };
    }
  }

  /**
   * 2. Adicionar item ao pedido
   * POST /picking/v1.0/orders/{orderId}/items
   */
  async addItemToOrder(orderId: string, itemData: AddItemRequest): Promise<PickingApiResponse<ItemOperationResponse>> {
    try {
      // Validações
      if (!this.activeSessions.has(orderId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.SEPARATION_NOT_STARTED,
            'Separação não iniciada. Inicie a separação antes de modificar itens.'
          ),
          timestamp: new Date()
        };
      }

      if (!PickingHelpers.validateProductId(itemData.product_id)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.INVALID_PRODUCT_ID,
            'product_id é obrigatório e deve ser válido'
          ),
          timestamp: new Date()
        };
      }

      if (!PickingHelpers.validateQuantity(itemData.quantity)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.INVALID_QUANTITY,
            'Quantidade deve ser um número inteiro positivo'
          ),
          timestamp: new Date()
        };
      }

      const requestId = PickingHelpers.generateRequestId();
      const url = PickingHelpers.buildEndpointUrl(
        PICKING_CONSTANTS.API.ENDPOINTS.ADD_ITEM,
        { orderId }
      );

      const headers = PickingHelpers.generateHeaders(this.token, this.merchantId, {
        [PICKING_CONSTANTS.HEADERS.REQUEST_ID]: requestId
      });

      console.log(`🔹 Adicionando item - Order: ${orderId}, Product: ${itemData.product_id}, Qty: ${itemData.quantity}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(PickingHelpers.sanitizeRequestData(itemData))
      });

      const responseData = await response.json();

      // Atualizar sessão ativa
      const session = this.activeSessions.get(orderId)!;
      session.lastActivity = new Date();
      session.operations.push({
        operationId: requestId,
        type: 'ADD_ITEM',
        timestamp: new Date(),
        status: response.ok ? 'SUCCESS' : 'FAILED',
        data: itemData,
        error: response.ok ? undefined : PickingHelpers.parseIfoodError(responseData)
      });

      if (response.ok) {
        console.log(`✅ Item adicionado com sucesso - Order: ${orderId}, Product: ${itemData.product_id}`);
        
        return {
          success: true,
          data: {
            uniqueId: (responseData as any)?.uniqueId || requestId,
            operation: 'ADDED',
            status: 'SUCCESS'
          },
          timestamp: new Date(),
          requestId
        };
      } else {
        console.error(`❌ Erro ao adicionar item - Order: ${orderId}`, responseData);
        return {
          success: false,
          error: PickingHelpers.parseIfoodError(responseData),
          timestamp: new Date(),
          requestId
        };
      }
    } catch (error: any) {
      console.error(`🚨 Erro interno ao adicionar item - Order: ${orderId}`, error);
      return {
        success: false,
        error: PickingHelpers.createPickingError(
          PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
          `Erro de rede: ${error.message}`,
          error,
          true
        ),
        timestamp: new Date()
      };
    }
  }

  /**
   * 3. Atualizar item do pedido
   * PATCH /picking/v1.0/orders/{orderId}/items/{uniqueId}
   */
  async updateOrderItem(orderId: string, uniqueId: string, updates: UpdateItemRequest): Promise<PickingApiResponse<ItemOperationResponse>> {
    try {
      // Validações
      if (!this.activeSessions.has(orderId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.SEPARATION_NOT_STARTED,
            'Separação não iniciada. Inicie a separação antes de modificar itens.'
          ),
          timestamp: new Date()
        };
      }

      if (!PickingHelpers.validateUniqueId(uniqueId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.ITEM_NOT_FOUND,
            'uniqueId deve ser um UUID válido'
          ),
          timestamp: new Date()
        };
      }

      if (updates.quantity !== undefined && !PickingHelpers.validateQuantity(updates.quantity)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.INVALID_QUANTITY,
            'Quantidade deve ser um número inteiro positivo'
          ),
          timestamp: new Date()
        };
      }

      if (updates.product_id && !PickingHelpers.validateProductId(updates.product_id)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.INVALID_PRODUCT_ID,
            'product_id deve ser válido se fornecido'
          ),
          timestamp: new Date()
        };
      }

      const requestId = PickingHelpers.generateRequestId();
      const url = PickingHelpers.buildEndpointUrl(
        PICKING_CONSTANTS.API.ENDPOINTS.UPDATE_ITEM,
        { orderId, uniqueId }
      );

      const headers = PickingHelpers.generateHeaders(this.token, this.merchantId, {
        [PICKING_CONSTANTS.HEADERS.REQUEST_ID]: requestId
      });

      console.log(`🔹 Atualizando item - Order: ${orderId}, UniqueId: ${uniqueId}`);

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(PickingHelpers.sanitizeRequestData(updates))
      });

      const responseData = await response.json();

      // Atualizar sessão ativa
      const session = this.activeSessions.get(orderId)!;
      session.lastActivity = new Date();
      session.operations.push({
        operationId: requestId,
        type: 'UPDATE_ITEM',
        timestamp: new Date(),
        status: response.ok ? 'SUCCESS' : 'FAILED',
        data: { uniqueId, ...updates },
        error: response.ok ? undefined : PickingHelpers.parseIfoodError(responseData)
      });

      if (response.ok) {
        console.log(`✅ Item atualizado com sucesso - Order: ${orderId}, UniqueId: ${uniqueId}`);
        
        return {
          success: true,
          data: {
            uniqueId,
            operation: 'UPDATED',
            status: 'SUCCESS'
          },
          timestamp: new Date(),
          requestId
        };
      } else {
        console.error(`❌ Erro ao atualizar item - Order: ${orderId}, UniqueId: ${uniqueId}`, responseData);
        return {
          success: false,
          error: PickingHelpers.parseIfoodError(responseData),
          timestamp: new Date(),
          requestId
        };
      }
    } catch (error: any) {
      console.error(`🚨 Erro interno ao atualizar item - Order: ${orderId}`, error);
      return {
        success: false,
        error: PickingHelpers.createPickingError(
          PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
          `Erro de rede: ${error.message}`,
          error,
          true
        ),
        timestamp: new Date()
      };
    }
  }

  /**
   * 4. Remover item do pedido
   * DELETE /picking/v1.0/orders/{orderId}/items/{uniqueId}
   */
  async removeOrderItem(orderId: string, uniqueId: string, reason?: string): Promise<PickingApiResponse<ItemOperationResponse>> {
    try {
      // Validações
      if (!this.activeSessions.has(orderId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.SEPARATION_NOT_STARTED,
            'Separação não iniciada. Inicie a separação antes de modificar itens.'
          ),
          timestamp: new Date()
        };
      }

      if (!PickingHelpers.validateUniqueId(uniqueId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.ITEM_NOT_FOUND,
            'uniqueId deve ser um UUID válido'
          ),
          timestamp: new Date()
        };
      }

      const requestId = PickingHelpers.generateRequestId();
      const url = PickingHelpers.buildEndpointUrl(
        PICKING_CONSTANTS.API.ENDPOINTS.REMOVE_ITEM,
        { orderId, uniqueId }
      );

      const headers = PickingHelpers.generateHeaders(this.token, this.merchantId, {
        [PICKING_CONSTANTS.HEADERS.REQUEST_ID]: requestId
      });

      console.log(`🔹 Removendo item - Order: ${orderId}, UniqueId: ${uniqueId}, Reason: ${reason || 'N/A'}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      const responseData = response.status !== 204 ? await response.json() : {};

      // Atualizar sessão ativa
      const session = this.activeSessions.get(orderId)!;
      session.lastActivity = new Date();
      session.operations.push({
        operationId: requestId,
        type: 'REMOVE_ITEM',
        timestamp: new Date(),
        status: response.ok ? 'SUCCESS' : 'FAILED',
        data: { uniqueId, reason },
        error: response.ok ? undefined : PickingHelpers.parseIfoodError(responseData)
      });

      if (response.ok) {
        console.log(`✅ Item removido com sucesso - Order: ${orderId}, UniqueId: ${uniqueId}`);
        
        return {
          success: true,
          data: {
            uniqueId,
            operation: 'REMOVED',
            status: 'SUCCESS'
          },
          timestamp: new Date(),
          requestId
        };
      } else {
        console.error(`❌ Erro ao remover item - Order: ${orderId}, UniqueId: ${uniqueId}`, responseData);
        return {
          success: false,
          error: PickingHelpers.parseIfoodError(responseData),
          timestamp: new Date(),
          requestId
        };
      }
    } catch (error: any) {
      console.error(`🚨 Erro interno ao remover item - Order: ${orderId}`, error);
      return {
        success: false,
        error: PickingHelpers.createPickingError(
          PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
          `Erro de rede: ${error.message}`,
          error,
          true
        ),
        timestamp: new Date()
      };
    }
  }

  /**
   * 5. Finalizar separação
   * POST /picking/v1.0/endSeparation
   */
  async endSeparation(orderId: string, requestData?: EndSeparationRequest): Promise<PickingApiResponse<EndSeparationResponse>> {
    try {
      // Validações
      if (!this.activeSessions.has(orderId)) {
        return {
          success: false,
          error: PickingHelpers.createPickingError(
            PICKING_CONSTANTS.ERROR_CODES.SEPARATION_NOT_STARTED,
            'Separação não iniciada. Inicie a separação antes de finalizá-la.'
          ),
          timestamp: new Date()
        };
      }

      const session = this.activeSessions.get(orderId)!;
      const requestId = PickingHelpers.generateRequestId();
      const url = PickingHelpers.buildEndpointUrl(PICKING_CONSTANTS.API.ENDPOINTS.END_SEPARATION);

      const headers = PickingHelpers.generateHeaders(this.token, this.merchantId, {
        [PICKING_CONSTANTS.HEADERS.REQUEST_ID]: requestId
      });

      const bodyData = {
        orderId,
        separationId: session.sessionId,
        ...requestData
      };

      console.log(`🚀 Finalizando separação - Order: ${orderId}, RequestId: ${requestId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(PickingHelpers.sanitizeRequestData(bodyData))
      });

      const responseData = await response.json();

      // Atualizar sessão ativa
      session.lastActivity = new Date();
      session.operations.push({
        operationId: requestId,
        type: 'END_SEPARATION',
        timestamp: new Date(),
        status: response.ok ? 'SUCCESS' : 'FAILED',
        data: bodyData,
        error: response.ok ? undefined : PickingHelpers.parseIfoodError(responseData)
      });

      if (response.ok) {
        // Finalizar sessão
        session.status = 'COMPLETED';
        this.activeSessions.delete(orderId);

        console.log(`✅ Separação finalizada com sucesso - Order: ${orderId}`);
        
        return {
          success: true,
          data: {
            orderId,
            separationId: session.sessionId,
            status: 'COMPLETED',
            modificationsApplied: true
          },
          timestamp: new Date(),
          requestId
        };
      } else {
        // Marcar sessão como falhada
        session.status = 'FAILED';
        
        console.error(`❌ Erro ao finalizar separação - Order: ${orderId}`, responseData);
        return {
          success: false,
          error: PickingHelpers.parseIfoodError(responseData),
          timestamp: new Date(),
          requestId
        };
      }
    } catch (error: any) {
      console.error(`🚨 Erro interno ao finalizar separação - Order: ${orderId}`, error);
      
      // Marcar sessão como falhada
      const session = this.activeSessions.get(orderId);
      if (session) {
        session.status = 'FAILED';
      }
      
      return {
        success: false,
        error: PickingHelpers.createPickingError(
          PICKING_CONSTANTS.ERROR_CODES.NETWORK_ERROR,
          `Erro de rede: ${error.message}`,
          error,
          true
        ),
        timestamp: new Date()
      };
    }
  }

  /**
   * Métodos auxiliares para gerenciamento de sessões
   */

  getSeparationStatus(orderId: string): PickingSeparationStatus | null {
    const session = this.activeSessions.get(orderId);
    if (!session) return null;

    return {
      orderId: session.orderId,
      status: session.status,
      separationId: session.sessionId,
      startedAt: session.startedAt,
      completedAt: session.status === 'COMPLETED' ? session.lastActivity : undefined,
      modifiedItems: session.operations
        .filter(op => ['ADD_ITEM', 'UPDATE_ITEM', 'REMOVE_ITEM'].includes(op.type))
        .map(op => ({
          uniqueId: op.data?.uniqueId || op.operationId,
          action: op.type === 'ADD_ITEM' ? 'ADDED' : 
                  op.type === 'UPDATE_ITEM' ? 'UPDATED' : 'REMOVED',
          timestamp: op.timestamp,
          originalItem: undefined,
          newItem: op.data
        }))
    };
  }

  getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  cancelSeparation(orderId: string): boolean {
    const session = this.activeSessions.get(orderId);
    if (!session) return false;

    session.status = 'CANCELLED';
    this.activeSessions.delete(orderId);
    
    console.log(`🚫 Separação cancelada - Order: ${orderId}`);
    return true;
  }

  /**
   * Atualizar token de autenticação
   */
  updateToken(newToken: string): void {
    this.token = newToken;
    console.log('🔑 Token de autenticação atualizado');
  }
}