require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware de configuração
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:6000'],
  credentials: true
}));
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar rotas
const financialRoutes = require('./src/routes/financial');

// Registrar rotas
app.use('/api/financial', financialRoutes);

// Rota de teste de saúde
app.get('/health', (req, res) => {
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
app.get('/test-supabase', async (req, res) => {
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
  } catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar tabelas
app.get('/tables', async (req, res) => {
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
  } catch (err) {
    console.error('Erro ao listar tabelas:', err);
    res.status(500).json({ error: err.message });
  }
});

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
`);
});

module.exports = app;