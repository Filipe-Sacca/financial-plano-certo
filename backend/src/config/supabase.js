require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias!');
  process.exit(1);
}

// Criar cliente único do Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application': 'financial-plano-certo'
    }
  }
});

// Função auxiliar para executar queries com tratamento de erro
const executeQuery = async (query) => {
  try {
    const { data, error } = await query;

    if (error) {
      console.error('Erro na query Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
};

// Função para verificar conexão
const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('ifood_tokens')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // Ignorar erro de tabela vazia
      console.error('❌ Erro ao conectar com Supabase:', error);
      return false;
    }

    console.log('✅ Conectado ao Supabase com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar conexão:', error);
    return false;
  }
};

// Exportar cliente e funções auxiliares
module.exports = {
  supabase,
  executeQuery,
  checkConnection
};