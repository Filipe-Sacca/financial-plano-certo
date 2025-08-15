-- Criar tabela ifood_merchants para armazenar dados dos merchants do iFood
CREATE TABLE IF NOT EXISTS ifood_merchants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id TEXT NOT NULL UNIQUE, -- ID do merchant no iFood
  name TEXT NOT NULL,
  corporate_name TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('AVAILABLE', 'UNAVAILABLE', 'CLOSED')),
  cuisine_types TEXT[], -- Array de tipos de culinária
  phone TEXT,
  
  -- Endereço
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip_code TEXT,
  address_country TEXT,
  
  -- Horários de funcionamento (JSON)
  operating_hours JSONB,
  
  -- Métodos de entrega e pagamento
  delivery_methods TEXT[],
  payment_methods TEXT[],
  
  -- Métricas
  average_delivery_time INTEGER, -- em minutos
  minimum_order_value DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  
  -- Relacionamentos
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT unique_merchant_per_user UNIQUE (merchant_id, user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ifood_merchants_user_id ON ifood_merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_merchants_client_id ON ifood_merchants(client_id);
CREATE INDEX IF NOT EXISTS idx_ifood_merchants_merchant_id ON ifood_merchants(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ifood_merchants_status ON ifood_merchants(status);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ifood_merchants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_ifood_merchants_updated_at
  BEFORE UPDATE ON ifood_merchants
  FOR EACH ROW
  EXECUTE FUNCTION update_ifood_merchants_updated_at();

-- Comentários para documentação
COMMENT ON TABLE ifood_merchants IS 'Armazena dados dos merchants (restaurantes) do iFood';
COMMENT ON COLUMN ifood_merchants.merchant_id IS 'ID único do merchant no sistema do iFood';
COMMENT ON COLUMN ifood_merchants.user_id IS 'Usuário que sincronizou este merchant';
COMMENT ON COLUMN ifood_merchants.client_id IS 'Cliente associado a este merchant';
COMMENT ON COLUMN ifood_merchants.last_sync_at IS 'Data da última sincronização com a API do iFood'; 