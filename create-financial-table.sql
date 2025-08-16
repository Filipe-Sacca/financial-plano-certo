-- Criar tabela financial_data para dados financeiros do iFood
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar a tabela
CREATE TABLE public.financial_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    merchant_id TEXT NOT NULL,
    order_id TEXT,
    transaction_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    transaction_type TEXT,
    status TEXT,
    payment_method TEXT,
    commission_rate DECIMAL(5,4),
    commission_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    transaction_date TIMESTAMPTZ,
    settlement_date TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_financial_data_user_id ON public.financial_data(user_id);
CREATE INDEX idx_financial_data_merchant_id ON public.financial_data(merchant_id);
CREATE INDEX idx_financial_data_transaction_date ON public.financial_data(transaction_date);

-- Habilitar RLS
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own financial data" ON public.financial_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial data" ON public.financial_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial data" ON public.financial_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_data_updated_at
    BEFORE UPDATE ON public.financial_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();