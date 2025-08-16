-- Create financial_data table for iFood financial integration
CREATE TABLE IF NOT EXISTS public.financial_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    merchant_id TEXT NOT NULL,
    order_id TEXT,
    transaction_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    transaction_type TEXT, -- 'sale', 'refund', 'commission', etc.
    status TEXT, -- 'completed', 'pending', 'cancelled', etc.
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_data_user_id ON public.financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_merchant_id ON public.financial_data(merchant_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_transaction_date ON public.financial_data(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_data_status ON public.financial_data(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own financial data" ON public.financial_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial data" ON public.financial_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial data" ON public.financial_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial data" ON public.financial_data
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
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

-- Add comments for documentation
COMMENT ON TABLE public.financial_data IS 'Dados financeiros e transações do iFood';
COMMENT ON COLUMN public.financial_data.user_id IS 'ID do usuário proprietário dos dados';
COMMENT ON COLUMN public.financial_data.merchant_id IS 'ID do merchant/restaurante no iFood';
COMMENT ON COLUMN public.financial_data.transaction_type IS 'Tipo da transação: sale, refund, commission, etc.';
COMMENT ON COLUMN public.financial_data.status IS 'Status da transação: completed, pending, cancelled, etc.';
COMMENT ON COLUMN public.financial_data.commission_rate IS 'Taxa de comissão (ex: 0.1250 para 12.50%)';
COMMENT ON COLUMN public.financial_data.net_amount IS 'Valor líquido após descontos e comissões';
COMMENT ON COLUMN public.financial_data.metadata IS 'Dados adicionais em formato JSON';