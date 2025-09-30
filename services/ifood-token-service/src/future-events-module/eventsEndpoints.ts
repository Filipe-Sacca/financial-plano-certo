/**
 * 🔄 ENDPOINTS DE EVENTOS - PARA IMPLEMENTAÇÃO FUTURA
 *
 * Estes endpoints devem ser adicionados ao server.ts quando
 * o módulo de eventos for implementado.
 *
 * ⚠️ IMPORTANTE: Código desativado para implementação futura
 */

import { Request, Response } from 'express';
import { eventPollingService } from './pollingService';

/**
 * ADICIONAR ESTES ENDPOINTS AO SERVER.TS QUANDO IMPLEMENTAR:
 *
 * import { eventsRouter } from './future-events-module/eventsEndpoints';
 * app.use('/events', eventsRouter);
 */

export const setupEventsEndpoints = (app: any) => {

  // ====== POLLING ENDPOINTS ======

  /**
   * Iniciar polling de eventos para um merchant
   * POST /events/polling/start
   */
  app.post('/events/polling/start', async (req: Request, res: Response) => {
    try {
      const { merchantId, userId, filters } = req.body;

      if (!merchantId || !userId) {
        return res.status(400).json({
          error: 'merchantId and userId are required'
        });
      }

      await eventPollingService.startPolling({
        merchantId,
        userId,
        filters
      });

      res.json({
        status: 'success',
        message: `Polling started for merchant ${merchantId}`,
        interval: '30 seconds'
      });
    } catch (error) {
      console.error('❌ Error starting polling:', error);
      res.status(500).json({
        error: 'Failed to start polling',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Parar polling de eventos para um merchant
   * POST /events/polling/stop
   */
  app.post('/events/polling/stop', async (req: Request, res: Response) => {
    try {
      const { merchantId, userId } = req.body;

      if (!merchantId || !userId) {
        return res.status(400).json({
          error: 'merchantId and userId are required'
        });
      }

      await eventPollingService.stopPolling(merchantId, userId);

      res.json({
        status: 'success',
        message: `Polling stopped for merchant ${merchantId}`
      });
    } catch (error) {
      console.error('❌ Error stopping polling:', error);
      res.status(500).json({
        error: 'Failed to stop polling',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Status do polling
   * GET /events/polling/status
   */
  app.get('/events/polling/status', async (req: Request, res: Response) => {
    try {
      const status = eventPollingService.getPollingStatus();

      res.json({
        status: 'success',
        data: status
      });
    } catch (error) {
      console.error('❌ Error getting polling status:', error);
      res.status(500).json({
        error: 'Failed to get polling status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ====== DIRECT EVENT ENDPOINTS (Para teste/debug) ======

  /**
   * Buscar eventos manualmente (sem polling automático)
   * GET /events/fetch
   *
   * Headers necessários:
   * - x-polling-merchants: merchantId
   * - Authorization: Bearer {token}
   */
  app.get('/events/fetch', async (req: Request, res: Response) => {
    try {
      const merchantId = req.headers['x-polling-merchants'] as string;
      const { user_id } = req.query;

      if (!merchantId || !user_id) {
        return res.status(400).json({
          error: 'x-polling-merchants header and user_id are required'
        });
      }

      // TODO: Implementar busca manual de eventos
      // Isso seria útil para testar sem esperar o ciclo de 30 segundos

      res.json({
        status: 'success',
        message: 'Manual fetch endpoint - to be implemented',
        merchantId,
        note: 'This will fetch events from iFood API directly'
      });
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      res.status(500).json({
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Enviar acknowledgment manualmente
   * POST /events/acknowledgment
   *
   * Body:
   * {
   *   "eventIds": ["event1", "event2", "event3"]
   * }
   */
  app.post('/events/acknowledgment', async (req: Request, res: Response) => {
    try {
      const { eventIds, userId } = req.body;

      if (!eventIds || !Array.isArray(eventIds)) {
        return res.status(400).json({
          error: 'eventIds array is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      // TODO: Implementar acknowledgment manual
      console.log(`✅ Acknowledging ${eventIds.length} events for user ${userId}`);

      res.json({
        status: 'success',
        message: `${eventIds.length} events acknowledged`,
        eventIds
      });
    } catch (error) {
      console.error('❌ Error acknowledging events:', error);
      res.status(500).json({
        error: 'Failed to acknowledge events',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ====== EVENT HISTORY ENDPOINTS ======

  /**
   * Buscar histórico de eventos
   * GET /events/history/:merchantId
   */
  app.get('/events/history/:merchantId', async (req: Request, res: Response) => {
    try {
      const { merchantId } = req.params;
      const { user_id, limit = 100, offset = 0 } = req.query;

      if (!user_id) {
        return res.status(400).json({
          error: 'user_id is required'
        });
      }

      // TODO: Buscar eventos do banco de dados
      // SELECT * FROM ifood_events WHERE merchant_id = ? AND user_id = ?
      // ORDER BY created_at DESC LIMIT ? OFFSET ?

      res.json({
        status: 'success',
        message: 'Event history endpoint - to be implemented',
        merchantId,
        pagination: {
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      console.error('❌ Error getting event history:', error);
      res.status(500).json({
        error: 'Failed to get event history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Buscar erros de polling
   * GET /events/errors/:merchantId
   */
  app.get('/events/errors/:merchantId', async (req: Request, res: Response) => {
    try {
      const { merchantId } = req.params;
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          error: 'user_id is required'
        });
      }

      // TODO: Buscar erros do banco de dados
      // SELECT * FROM ifood_polling_errors WHERE merchant_id = ? AND user_id = ?
      // ORDER BY created_at DESC

      res.json({
        status: 'success',
        message: 'Polling errors endpoint - to be implemented',
        merchantId
      });
    } catch (error) {
      console.error('❌ Error getting polling errors:', error);
      res.status(500).json({
        error: 'Failed to get polling errors',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ====== WEBHOOK ENDPOINT (Alternativa ao polling) ======

  /**
   * Receber eventos via webhook (alternativa futura ao polling)
   * POST /events/webhook
   *
   * Este endpoint seria usado se o iFood implementar webhooks
   * ao invés de polling
   */
  app.post('/events/webhook', async (req: Request, res: Response) => {
    try {
      const { events } = req.body;
      const signature = req.headers['x-ifood-signature'];

      // TODO: Validar assinatura do webhook
      // TODO: Processar eventos recebidos
      // TODO: Salvar no banco de dados

      console.log(`📨 [WEBHOOK] Received ${events?.length || 0} events`);

      res.json({
        status: 'success',
        message: 'Webhook endpoint - to be implemented',
        eventsReceived: events?.length || 0
      });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

/**
 * Exemplo de como adicionar ao server.ts:
 *
 * // Importar no topo do arquivo
 * import { setupEventsEndpoints } from './future-events-module/eventsEndpoints';
 *
 * // Adicionar após os outros endpoints
 * // ====== EVENTS MODULE (FUTURE) ======
 * if (process.env.ENABLE_EVENTS_MODULE === 'true') {
 *   setupEventsEndpoints(app);
 *   console.log('📢 Events module endpoints enabled');
 * }
 */