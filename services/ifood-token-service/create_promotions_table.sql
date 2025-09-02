-- Criar tabela para armazenar promoções do iFood
-- Baseado no padrão das outras tabelas do projeto

CREATE TABLE IF NOT EXISTS ifood_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificadores principais
  aggregation_id TEXT NOT NULL UNIQUE, -- Retornado pelo iFood
  aggregation_tag TEXT NOT NULL,       -- Enviado por nós
  
  -- Associações
  merchant_id TEXT NOT NULL,           -- ID do merchant
  user_id UUID NOT NULL,               -- ID do usuário
  
  -- Dados da promoção
  promotion_name TEXT NOT NULL,
  channels TEXT[] DEFAULT ARRAY['IFOOD-APP'],
  
  -- Status e controle
  status TEXT DEFAULT 'PENDING',       -- PENDING, ACTIVE, EXPIRED, CANCELLED
  
  -- Dados completos (JSON)
  promotion_data JSONB,               -- Dados completos da promoção
  response_data JSONB,                -- Resposta do iFood
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT fk_ifood_promotions_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ifood_promotions_user_id ON ifood_promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_promotions_merchant_id ON ifood_promotions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ifood_promotions_aggregation_id ON ifood_promotions(aggregation_id);
CREATE INDEX IF NOT EXISTS idx_ifood_promotions_status ON ifood_promotions(status);
CREATE INDEX IF NOT EXISTS idx_ifood_promotions_created_at ON ifood_promotions(created_at);

-- RLS (Row Level Security)
ALTER TABLE ifood_promotions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias promoções
CREATE POLICY "Users can view own promotions" ON ifood_promotions
  FOR ALL USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE ifood_promotions IS 'Armazena promoções criadas via API do iFood';
COMMENT ON COLUMN ifood_promotions.aggregation_id IS 'ID retornado pelo iFood para tracking da promoção';
COMMENT ON COLUMN ifood_promotions.aggregation_tag IS 'Tag enviada ao iFood para identificação';
COMMENT ON COLUMN ifood_promotions.promotion_data IS 'Dados completos da promoção enviados ao iFood';
COMMENT ON COLUMN ifood_promotions.response_data IS 'Resposta completa recebida do iFood';