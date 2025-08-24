-- Adicionar campos do iFood na tabela products se não existirem
-- Este script adiciona os campos necessários para integração com iFood

-- Adicionar coluna item_id se não existir
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS item_id VARCHAR(255) UNIQUE;

-- Adicionar coluna product_id se não existir  
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_id VARCHAR(255);

-- Adicionar coluna original_price se não existir
ALTER TABLE products
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- Adicionar coluna external_code se não existir
ALTER TABLE products
ADD COLUMN IF NOT EXISTS external_code VARCHAR(255);

-- Adicionar coluna imagePath se já não existir (caso use image_path)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS imagePath TEXT;

-- Adicionar coluna is_active se não existir (para status)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar updated_at se não existir
ALTER TABLE products
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_item_id ON products(item_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_client_id ON products(client_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at_trigger ON products;

CREATE TRIGGER update_products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();

-- Comentário sobre a migração
COMMENT ON TABLE products IS 'Tabela unificada de produtos - inclui produtos locais e do iFood';
COMMENT ON COLUMN products.item_id IS 'ID único do item no iFood (ex: item_1234567_abc)';
COMMENT ON COLUMN products.product_id IS 'ID do produto base no iFood';
COMMENT ON COLUMN products.original_price IS 'Preço original antes de descontos';
COMMENT ON COLUMN products.is_active IS 'Status do produto (true = disponível, false = indisponível)';