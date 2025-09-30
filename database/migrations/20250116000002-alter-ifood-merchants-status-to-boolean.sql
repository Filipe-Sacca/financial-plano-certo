-- Alterar coluna status da tabela ifood_merchants para aceitar apenas true/false
-- Migration: Converter status de TEXT para BOOLEAN

-- Primeiro, vamos mapear os valores existentes:
-- 'AVAILABLE' -> true
-- 'UNAVAILABLE' ou 'CLOSED' -> false

-- Adicionar nova coluna temporária
ALTER TABLE ifood_merchants ADD COLUMN status_boolean BOOLEAN;

-- Migrar dados existentes
UPDATE ifood_merchants 
SET status_boolean = CASE 
  WHEN status = 'AVAILABLE' THEN true
  ELSE false
END;

-- Definir NOT NULL na nova coluna
ALTER TABLE ifood_merchants ALTER COLUMN status_boolean SET NOT NULL;

-- Definir valor padrão
ALTER TABLE ifood_merchants ALTER COLUMN status_boolean SET DEFAULT false;

-- Remover coluna antiga
ALTER TABLE ifood_merchants DROP COLUMN status;

-- Renomear nova coluna para status
ALTER TABLE ifood_merchants RENAME COLUMN status_boolean TO status;

-- Recriar índice para a nova coluna
DROP INDEX IF EXISTS idx_ifood_merchants_status;
CREATE INDEX idx_ifood_merchants_status ON ifood_merchants(status);

-- Adicionar comentário
COMMENT ON COLUMN ifood_merchants.status IS 'Status do merchant: true = disponível, false = indisponível/fechado';