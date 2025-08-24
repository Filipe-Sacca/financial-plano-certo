-- Script SQL para criar estrutura completa de categorias e produtos do iFood

-- Tabela para armazenar categorias do iFood
CREATE TABLE IF NOT EXISTS ifood_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id VARCHAR NOT NULL UNIQUE, -- ID único gerado internamente (agora único globalmente)
    ifood_category_id VARCHAR, -- ID retornado pela API do iFood
    merchant_id VARCHAR NOT NULL,
    catalog_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    external_code VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'AVAILABLE',
    index INTEGER DEFAULT 0,
    template VARCHAR NOT NULL DEFAULT 'DEFAULT',
    sequence_number INTEGER DEFAULT 0, -- Ordem da categoria no iFood
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint única para categoria do iFood por merchant
    UNIQUE(ifood_category_id, merchant_id)
);

-- Atualizar tabela products existente para incluir referência às categorias do iFood
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ifood_category_id VARCHAR, -- Referência ao ID da categoria do iFood
ADD COLUMN IF NOT EXISTS ifood_category_name VARCHAR; -- Nome da categoria para facilitar queries

-- Índice para performance na nova coluna
CREATE INDEX IF NOT EXISTS idx_products_ifood_category_id ON products(ifood_category_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ifood_categories_merchant_id ON ifood_categories(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ifood_categories_user_id ON ifood_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_categories_catalog_id ON ifood_categories(catalog_id);
CREATE INDEX IF NOT EXISTS idx_ifood_categories_ifood_id ON ifood_categories(ifood_category_id);

-- Índices removidos pois vamos usar a tabela products existente

-- Script finalizado - usar apenas a tabela ifood_categories + integração com products existente
