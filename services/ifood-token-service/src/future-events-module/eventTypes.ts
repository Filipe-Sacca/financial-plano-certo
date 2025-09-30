/**
 * 🔄 TIPOS DE EVENTOS - PARA IMPLEMENTAÇÃO FUTURA
 *
 * Definições de tipos para o sistema de eventos do iFood
 */

/**
 * Tipos de eventos suportados pelo iFood
 */
export enum EventType {
  // Eventos de Pedido
  PLACED = 'PLACED',                        // Novo pedido recebido
  CONFIRMED = 'CONFIRMED',                  // Pedido confirmado pelo restaurante
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',    // Pedido pronto para retirada
  DISPATCHED = 'DISPATCHED',                // Pedido saiu para entrega
  DELIVERED = 'DELIVERED',                  // Pedido entregue
  CANCELLED = 'CANCELLED',                  // Pedido cancelado

  // Eventos de Status
  STATUS_CHANGED = 'STATUS_CHANGED',        // Mudança genérica de status

  // Eventos de Entrega
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',      // Motorista designado
  DRIVER_NEAR = 'DRIVER_NEAR',              // Motorista próximo
  DELIVERY_DELAYED = 'DELIVERY_DELAYED',    // Entrega atrasada

  // Eventos de Merchant
  MERCHANT_OPENED = 'MERCHANT_OPENED',      // Loja aberta
  MERCHANT_CLOSED = 'MERCHANT_CLOSED',      // Loja fechada
  MERCHANT_PAUSED = 'MERCHANT_PAUSED',      // Loja pausada temporariamente

  // Eventos de Review
  NEW_REVIEW = 'NEW_REVIEW',                // Nova avaliação recebida
  REVIEW_REPLY_NEEDED = 'REVIEW_REPLY_NEEDED', // Avaliação precisa de resposta

  // Eventos de Cancelamento
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',  // Cancelamento solicitado
  CANCELLATION_DENIED = 'CANCELLATION_DENIED',        // Cancelamento negado
  CANCELLATION_APPROVED = 'CANCELLATION_APPROVED',    // Cancelamento aprovado

  // Eventos de Promoção
  PROMOTION_STARTED = 'PROMOTION_STARTED',  // Promoção iniciada
  PROMOTION_ENDED = 'PROMOTION_ENDED',      // Promoção finalizada
}

/**
 * Grupos de eventos para organização
 */
export enum EventGroup {
  ORDER = 'ORDER',          // Eventos relacionados a pedidos
  DELIVERY = 'DELIVERY',    // Eventos relacionados a entrega
  MERCHANT = 'MERCHANT',    // Eventos relacionados ao estabelecimento
  REVIEW = 'REVIEW',        // Eventos relacionados a avaliações
  PROMOTION = 'PROMOTION',  // Eventos relacionados a promoções
  FINANCIAL = 'FINANCIAL',  // Eventos relacionados a pagamentos
}

/**
 * Interface principal para eventos do iFood
 */
export interface IFoodEvent {
  id: string;                    // ID único do evento
  type: EventType;                // Tipo do evento
  group: EventGroup;              // Grupo do evento
  merchantId: string;             // ID do merchant relacionado
  orderId?: string;               // ID do pedido (se aplicável)
  customerId?: string;            // ID do cliente (se aplicável)
  createdAt: string;              // Data/hora de criação do evento
  data: EventData;                // Dados específicos do evento
  metadata?: EventMetadata;       // Metadados adicionais
}

/**
 * Dados específicos do evento (varia por tipo)
 */
export type EventData =
  | OrderEventData
  | DeliveryEventData
  | MerchantEventData
  | ReviewEventData;

/**
 * Dados de evento de pedido
 */
export interface OrderEventData {
  orderId: string;
  orderCode: string;
  status: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  deliveryAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

/**
 * Dados de evento de entrega
 */
export interface DeliveryEventData {
  deliveryId: string;
  orderId: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  status: string;
  trackingUrl?: string;
}

/**
 * Dados de evento de merchant
 */
export interface MerchantEventData {
  merchantId: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  reason?: string;
  expectedReopenTime?: string;
}

/**
 * Dados de evento de avaliação
 */
export interface ReviewEventData {
  reviewId: string;
  orderId: string;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  requiresReply: boolean;
}

/**
 * Metadados do evento
 */
export interface EventMetadata {
  source: string;          // Sistema que gerou o evento
  version: string;         // Versão da API
  timestamp: string;       // Timestamp do servidor
  retryCount?: number;     // Número de tentativas de entrega
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

/**
 * Request de acknowledgment
 */
export interface AcknowledgmentRequest {
  eventIds: string[];      // IDs dos eventos para confirmar recebimento
  userId: string;          // ID do usuário
  merchantId?: string;     // ID do merchant (opcional)
  timestamp: string;       // Timestamp do acknowledgment
}

/**
 * Response de polling
 */
export interface PollingResponse {
  events: IFoodEvent[];    // Array de eventos
  hasMore: boolean;        // Se há mais eventos disponíveis
  nextPollingToken?: string; // Token para próximo polling
}

/**
 * Configuração de filtros para polling
 */
export interface EventFilters {
  eventTypes?: EventType[];     // Filtrar por tipos específicos
  eventGroups?: EventGroup[];   // Filtrar por grupos
  startDate?: string;           // Data inicial
  endDate?: string;             // Data final
  merchantIds?: string[];      // IDs dos merchants
  orderIds?: string[];          // IDs dos pedidos específicos
}

/**
 * Status de processamento do evento
 */
export enum EventProcessingStatus {
  PENDING = 'PENDING',          // Aguardando processamento
  PROCESSING = 'PROCESSING',    // Em processamento
  PROCESSED = 'PROCESSED',      // Processado com sucesso
  FAILED = 'FAILED',            // Falha no processamento
  ACKNOWLEDGED = 'ACKNOWLEDGED', // Confirmado recebimento
  SKIPPED = 'SKIPPED',          // Pulado (duplicado ou filtrado)
}

/**
 * Registro de evento no banco de dados
 */
export interface EventRecord {
  id: number;                          // ID no banco local
  event_id: string;                    // ID do evento do iFood
  merchant_id: string;                 // ID do merchant
  user_id: string;                     // ID do usuário
  event_type: EventType;               // Tipo do evento
  event_group: EventGroup;             // Grupo do evento
  event_data: any;                     // Dados do evento (JSON)
  processing_status: EventProcessingStatus; // Status de processamento
  acknowledged_at?: string;            // Data/hora do acknowledgment
  processed_at?: string;               // Data/hora do processamento
  error_message?: string;              // Mensagem de erro (se houver)
  retry_count: number;                 // Número de tentativas
  created_at: string;                  // Data/hora de criação
  updated_at: string;                  // Data/hora de atualização
}