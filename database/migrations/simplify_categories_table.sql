-- ========================================
-- SIMPLIFICAR TABELA DE CATEGORIAS
-- Usar apenas o ID do iFood como chave primária
-- ========================================

-- 1. Criar nova tabela simplificada
CREATE TABLE IF NOT EXISTS ifood_categories_new (
    id VARCHAR(255) PRIMARY KEY,  -- ID do iFood (será a chave primária)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    template VARCHAR(50) DEFAULT 'DEFAULT',
    merchant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Copiar dados da tabela antiga usando o ifood_category_id como novo id
INSERT INTO ifood_categories_new (id, name, description, status, merchant_id, user_id, created_at, updated_at)
SELECT 
    ifood_category_id as id,  -- Usar o ID do iFood como ID principal
    name,
    description,
    status,
    merchant_id,
    user_id,
    created_at,
    updated_at
FROM ifood_categories
WHERE ifood_category_id IS NOT NULL;

-- 3. Renomear tabelas
ALTER TABLE ifood_categories RENAME TO ifood_categories_old_backup;
ALTER TABLE ifood_categories_new RENAME TO ifood_categories;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ifood_categories_merchant_id ON ifood_categories(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ifood_categories_user_id ON ifood_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_categories_status ON ifood_categories(status);

-- 5. Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ifood_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ifood_categories_updated_at_trigger ON ifood_categories;

CREATE TRIGGER update_ifood_categories_updated_at_trigger
BEFORE UPDATE ON ifood_categories
FOR EACH ROW EXECUTE FUNCTION update_ifood_categories_updated_at();

-- 6. Comentários sobre a migração
COMMENT ON TABLE ifood_categories IS 'Categorias do iFood - Usando ID do iFood como chave primária';
COMMENT ON COLUMN ifood_categories.id IS 'ID único da categoria no iFood (UUID)';
COMMENT ON COLUMN ifood_categories.name IS 'Nome da categoria';
COMMENT ON COLUMN ifood_categories.merchant_id IS 'ID do merchant no iFood';

-- Nota: A tabela antiga está em ifood_categories_old_backup caso precise reverter