-- Adicionar campo merchant_id à tabela products para relacionar produtos com merchants do iFood
ALTER TABLE public.products 
ADD COLUMN merchant_id TEXT;

-- Adicionar outras colunas do iFood que estão sendo usadas no código
ALTER TABLE public.products 
ADD COLUMN item_id TEXT,
ADD COLUMN imagePath TEXT,
ADD COLUMN product_id TEXT;

-- Alterar o campo is_active para aceitar valores AVAILABLE/UNAVAILABLE (enum-like)
ALTER TABLE public.products 
ALTER COLUMN is_active TYPE TEXT,
ALTER COLUMN is_active SET DEFAULT 'AVAILABLE';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_item_id ON public.products(item_id);
CREATE INDEX IF NOT EXISTS idx_products_product_id ON public.products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Comentários para documentação
COMMENT ON COLUMN products.merchant_id IS 'ID do merchant no iFood ao qual este produto pertence';
COMMENT ON COLUMN products.item_id IS 'ID único do item no sistema do iFood';
COMMENT ON COLUMN products.product_id IS 'ID alternativo do produto';
COMMENT ON COLUMN products.imagePath IS 'Caminho para a imagem do produto';

-- Atualizar produtos existentes (se houver) com merchant_id baseado no client_id
-- Esta query tenta associar produtos aos merchants usando a relação client_id -> ifood_merchant_id
UPDATE public.products 
SET merchant_id = (
  SELECT c.ifood_merchant_id 
  FROM clients c 
  WHERE c.id = products.client_id 
  AND c.ifood_merchant_id IS NOT NULL
)
WHERE merchant_id IS NULL AND client_id IS NOT NULL;