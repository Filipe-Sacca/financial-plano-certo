-- Script SQL para corrigir campos da tabela ifood_orders
-- Problema: campos com VARCHAR(50) muito pequenos para IDs do iFood

-- 1. Aumentar tamanho dos campos que podem ser grandes
ALTER TABLE ifood_orders 
ALTER COLUMN ifood_order_id TYPE VARCHAR(255);

ALTER TABLE ifood_orders 
ALTER COLUMN merchant_id TYPE VARCHAR(255);

ALTER TABLE ifood_orders 
ALTER COLUMN user_id TYPE VARCHAR(255);

-- 2. Campos de cliente que podem ser longos
ALTER TABLE ifood_orders 
ALTER COLUMN customer_name TYPE VARCHAR(255);

ALTER TABLE ifood_orders 
ALTER COLUMN customer_phone TYPE VARCHAR(50);

-- 3. Campos de endereço e pagamento
ALTER TABLE ifood_orders 
ALTER COLUMN payment_method TYPE VARCHAR(100);

-- 4. Campos de status e razão de cancelamento
ALTER TABLE ifood_orders 
ALTER COLUMN status TYPE VARCHAR(50);

ALTER TABLE ifood_orders 
ALTER COLUMN cancellation_reason TYPE TEXT;

ALTER TABLE ifood_orders 
ALTER COLUMN cancelled_by TYPE VARCHAR(100);

-- 5. Verificar se a tabela existe e os campos estão corretos
DO $$
BEGIN
    -- Verificar se a coluna ifood_order_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ifood_orders' 
        AND column_name = 'ifood_order_id'
    ) THEN
        RAISE NOTICE 'Coluna ifood_order_id não existe na tabela ifood_orders';
    ELSE
        RAISE NOTICE 'Coluna ifood_order_id corrigida para VARCHAR(255)';
    END IF;
END
$$;