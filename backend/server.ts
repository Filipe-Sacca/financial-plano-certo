import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 3000;

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware de configuração
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:6000',
    'http://5.161.109.157:5000',
    'http://5.161.109.157:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Middleware para logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar rotas
import financialRoutes from './src/routes/financial.js';
import merchantRoutes from './src/routes/merchantRoutes';
import qrcodeRoutes from './src/routes/qrcodeRoutes';
import openingHoursRoutes from './src/routes/openingHoursRoutes';
import interruptionRoutes from './src/routes/interruptionRoutes';

// Importar serviço de polling de status
import { IFoodMerchantStatusService } from './src/services/ifoodMerchantStatusService';

// Registrar rotas
app.use('/api/financial', financialRoutes);
app.use('/api', merchantRoutes);
app.use('/api', qrcodeRoutes);
app.use('/api', openingHoursRoutes);
app.use('/api', interruptionRoutes);

// Rota de teste de saúde
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    supabase: {
      url: supabaseUrl,
      connected: !!supabase
    }
  });
});

// Rota para testar conexão com Supabase
app.get('/test-supabase', async (req: Request, res: Response) => {
  try {
    // Tentar uma operação simples
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      console.error('Erro Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Conexão com Supabase OK!',
      data: data
    });
  } catch (err: any) {
    console.error('Erro interno:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar tabelas
app.get('/tables', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.rpc('get_table_names');

    if (error) {
      // Fallback para method direto se RPC não funcionar
      const response = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      return res.json({
        tables: response.data || [],
        error: response.error
      });
    }

    res.json({ tables: data });
  } catch (err: any) {
    console.error('Erro ao listar tabelas:', err);
    res.status(500).json({ error: err.message });
  }
});

// Iniciar polling de status de merchants (30 segundos)
// Requisitos de homologação: Polling de /merchants/{merchantId}/status a cada 30 segundos
console.log('🔄 Iniciando polling de status de merchants...');
IFoodMerchantStatusService.startScheduler(0.5); // 0.5 minutos = 30 segundos
console.log('✅ Polling configurado para rodar a cada 30 segundos');

// Iniciar servidor
app.listen(port, () => {
  console.log(`
🚀 Servidor de desenvolvimento rodando!
📍 URL: http://localhost:${port}
🔗 Supabase URL: ${supabaseUrl}
📊 Project ID: ${process.env.SUPABASE_PROJECT_ID}

Endpoints disponíveis:
- GET /health - Status do servidor
- GET /test-supabase - Testar conexão
- GET /tables - Listar tabelas

Endpoints Financeiros:
- GET /api/financial/settlements - Assentamentos financeiros
- GET /api/financial/events - Eventos financeiros
- GET /api/financial/sales - Vendas (últimos 7 dias)
- GET /api/financial/anticipations - Antecipações
- GET /api/financial/reconciliation - Reconciliação
- POST /api/financial/reconciliation/on-demand - Solicitar reconciliação
- GET /api/financial/reconciliation/on-demand/:id - Status da reconciliação
- GET /api/financial/summary - Resumo financeiro
- GET /api/financial/health - Status da integração

Endpoints de Merchants:
- POST /api/merchant - Processar merchant
- GET /api/merchant/check/:id - Verificar merchant
- POST /api/merchants/sync-all - Sincronizar todos os merchants
- POST /api/merchants/refresh - Refresh de merchants
- POST /api/merchants/fetch-from-ifood - Buscar merchants do iFood
- GET /api/merchants - Listar todos os merchants
- GET /api/merchants/:merchantId - Detalhes do merchant
- GET /api/merchants/:merchantId/status - Status do merchant

Endpoints de QR Code:
- POST /api/merchants/checkin-qrcode - Gerar QR code de check-in

Endpoints de Horários:
- GET /api/merchants/:merchantId/opening-hours - Listar horários
- PUT /api/merchants/:merchantId/opening-hours - Atualizar horários
- DELETE /api/merchants/:merchantId/opening-hours/delete - Deletar horário

Endpoints de Interrupções:
- GET /api/merchants/:merchantId/interruptions - Listar interrupções
- POST /api/merchants/:merchantId/interruptions - Criar interrupção
- DELETE /api/merchants/:merchantId/interruptions/:interruptionId - Deletar interrupção
- POST /api/merchants/:merchantId/interruptions/sync - Sincronizar interrupções
`);
});

export default app;