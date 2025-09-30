const express = require('express');
const router = express.Router();
const FinancialDataCollector = require('../services/FinancialDataCollector');
const { authenticateUser } = require('../middleware/auth');

// Middleware para validar merchant_id
const validateMerchant = (req, res, next) => {
  const merchantId = req.params.merchantId || req.query.merchant_id || req.body.merchant_id;

  if (!merchantId) {
    return res.status(400).json({
      success: false,
      error: 'merchant_id é obrigatório'
    });
  }

  req.merchantId = merchantId;
  next();
};

// GET /api/financial/settlements
// Lista assentamentos financeiros com paginação
router.get('/settlements', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const data = await FinancialDataCollector.collectSettlements(
      req.merchantId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: data.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar settlements:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/events
// Lista eventos financeiros com paginação
router.get('/events', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      start_date,
      end_date,
      event_type
    } = req.query;

    // Validar datas se fornecidas
    const filters = {};
    if (start_date) filters.startDate = start_date;
    if (end_date) filters.endDate = end_date;
    if (event_type) filters.eventType = event_type;

    const data = await FinancialDataCollector.collectFinancialEvents(
      req.merchantId,
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: data.length === parseInt(limit)
      },
      filters
    });
  } catch (error) {
    console.error('Erro ao buscar eventos financeiros:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/sales
// Lista vendas (últimos 7 dias apenas)
router.get('/sales', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    // API do iFood limita vendas aos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await FinancialDataCollector.collectSales(
      req.merchantId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: data.length === parseInt(limit)
      },
      note: 'API do iFood retorna apenas vendas dos últimos 7 dias',
      period: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/anticipations
// Lista antecipações
router.get('/anticipations', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      start_date,
      end_date
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (start_date) filters.startDate = start_date;
    if (end_date) filters.endDate = end_date;

    const data = await FinancialDataCollector.collectAnticipations(
      req.merchantId,
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: data.length === parseInt(limit)
      },
      filters
    });
  } catch (error) {
    console.error('Erro ao buscar antecipações:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/reconciliation
// Busca dados de reconciliação
router.get('/reconciliation', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      page = 1,
      limit = 100
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date e end_date são obrigatórios'
      });
    }

    const data = await FinancialDataCollector.collectReconciliation(
      req.merchantId,
      start_date,
      end_date,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data,
      period: {
        start: start_date,
        end: end_date
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: data.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar reconciliação:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/financial/reconciliation/on-demand
// Solicita reconciliação sob demanda
router.post('/reconciliation/on-demand', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date e end_date são obrigatórios'
      });
    }

    const requestData = await FinancialDataCollector.requestOnDemandReconciliation(
      req.merchantId,
      start_date,
      end_date
    );

    res.json({
      success: true,
      data: requestData,
      message: 'Reconciliação solicitada com sucesso. Use o requestId para verificar o status.',
      period: {
        start: start_date,
        end: end_date
      }
    });
  } catch (error) {
    console.error('Erro ao solicitar reconciliação:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/reconciliation/on-demand/:requestId
// Verifica status de reconciliação sob demanda
router.get('/reconciliation/on-demand/:requestId', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'requestId é obrigatório'
      });
    }

    const status = await FinancialDataCollector.checkOnDemandStatus(
      req.merchantId,
      requestId
    );

    res.json({
      success: true,
      data: status,
      requestId
    });
  } catch (error) {
    console.error('Erro ao verificar status de reconciliação:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/summary
// Resumo financeiro agregado (endpoint adicional útil)
router.get('/summary', authenticateUser, validateMerchant, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Buscar dados agregados de diferentes fontes
    const [settlements, events, sales] = await Promise.all([
      FinancialDataCollector.collectSettlements(req.merchantId, 1, 10),
      FinancialDataCollector.collectFinancialEvents(req.merchantId, 1, 10),
      FinancialDataCollector.collectSales(req.merchantId, 1, 10)
    ]);

    // Calcular métricas resumidas
    const summary = {
      totalSettlements: settlements.reduce((sum, s) => sum + (s.amount || 0), 0),
      recentEvents: events.length,
      totalSales: sales.reduce((sum, s) => sum + (s.total || 0), 0),
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: summary,
      period: {
        start: start_date || 'not_specified',
        end: end_date || 'not_specified'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(error.message.includes('Token não encontrado') ? 401 : 500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/financial/health
// Verificar saúde da integração financeira
router.get('/health', authenticateUser, async (req, res) => {
  try {
    const status = {
      service: 'financial-api',
      status: 'operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        settlements: 'active',
        events: 'active',
        sales: 'active',
        anticipations: 'active',
        reconciliation: 'active',
        onDemand: 'active'
      }
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Erro ao verificar saúde:', error);
    res.status(500).json({
      success: false,
      error: 'Serviço financeiro indisponível'
    });
  }
});

module.exports = router;