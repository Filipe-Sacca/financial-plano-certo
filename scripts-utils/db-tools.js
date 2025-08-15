require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente PostgreSQL direto
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
});

class DatabaseTools {
  async connectPG() {
    try {
      await pgClient.connect();
      console.log('✅ Conectado ao PostgreSQL');
    } catch (error) {
      console.error('❌ Erro ao conectar PostgreSQL:', error.message);
    }
  }

  async listTables() {
    console.log('\n📋 Listando tabelas...');
    try {
      const result = await pgClient.query(`
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.table(result.rows);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao listar tabelas:', error.message);
    }
  }

  async createSampleTable() {
    console.log('\n🔨 Criando tabela de exemplo...');
    try {
      const result = await pgClient.query(`
        CREATE TABLE IF NOT EXISTS sample_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Tabela criada com sucesso!');
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar tabela:', error.message);
    }
  }

  async insertSampleData() {
    console.log('\n📝 Inserindo dados de exemplo...');
    try {
      const result = await pgClient.query(`
        INSERT INTO sample_table (name, email) VALUES
        ('João Silva', 'joao@email.com'),
        ('Maria Santos', 'maria@email.com')
        ON CONFLICT (email) DO NOTHING;
      `);
      
      console.log('✅ Dados inseridos!');
      return result;
    } catch (error) {
      console.error('❌ Erro ao inserir dados:', error.message);
    }
  }

  async testSupabaseClient() {
    console.log('\n🧪 Testando Supabase Client...');
    try {
      const { data, error } = await supabase
        .from('sample_table')
        .select('*')
        .limit(5);

      if (error) {
        console.error('❌ Erro Supabase:', error.message);
        return;
      }

      console.log('✅ Dados via Supabase Client:');
      console.table(data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao testar client:', error.message);
    }
  }

  async close() {
    await pgClient.end();
    console.log('🔐 Conexão fechada');
  }
}

// CLI para executar comandos
if (require.main === module) {
  const tools = new DatabaseTools();
  const command = process.argv[2];

  (async () => {
    await tools.connectPG();

    switch (command) {
      case 'tables':
        await tools.listTables();
        break;
      case 'create':
        await tools.createSampleTable();
        break;
      case 'seed':
        await tools.insertSampleData();
        break;
      case 'test':
        await tools.testSupabaseClient();
        break;
      case 'setup':
        await tools.createSampleTable();
        await tools.insertSampleData();
        await tools.testSupabaseClient();
        break;
      default:
        console.log(`
🛠️  Database Tools - Comandos disponíveis:

node db-tools.js tables  - Listar todas as tabelas
node db-tools.js create  - Criar tabela de exemplo  
node db-tools.js seed    - Inserir dados de exemplo
node db-tools.js test    - Testar Supabase Client
node db-tools.js setup   - Fazer setup completo
        `);
    }

    await tools.close();
  })();
}

module.exports = DatabaseTools;