-- Criar nova tabela para dados detalhados do iFood com análise financeira especializada
CREATE TABLE public.ifood_detailed_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  date DATE NOT NULL,
  order_number TEXT NOT NULL,
  billing_type TEXT,
  order_date DATE,
  payment_date DATE,
  payment_origin TEXT,
  
  -- Valores financeiros
  items_value NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  service_fee NUMERIC DEFAULT 0,
  gross_revenue NUMERIC DEFAULT 0,
  
  -- Promoções e incentivos
  ifood_promotions NUMERIC DEFAULT 0,
  store_promotions NUMERIC DEFAULT 0,
  
  -- Comissões
  ifood_commission_value NUMERIC DEFAULT 0,
  transaction_commission NUMERIC DEFAULT 0,
  weekly_plan_fee NUMERIC DEFAULT 0,
  
  -- Valores finais
  net_value NUMERIC DEFAULT 0,
  
  -- Metadados
  source TEXT DEFAULT 'ifood',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_ifood_detailed_analytics_client_id ON public.ifood_detailed_analytics(client_id);
CREATE INDEX idx_ifood_detailed_analytics_date ON public.ifood_detailed_analytics(date);
CREATE INDEX idx_ifood_detailed_analytics_payment_origin ON public.ifood_detailed_analytics(payment_origin);

-- Tabela para consolidação de análise por formas de pagamento
CREATE TABLE public.payment_method_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  orders_count INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  percentage_orders NUMERIC DEFAULT 0,
  percentage_revenue NUMERIC DEFAULT 0,
  source TEXT DEFAULT 'ifood',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_payment_method_analytics_client_id ON public.payment_method_analytics(client_id);
CREATE INDEX idx_payment_method_analytics_date ON public.payment_method_analytics(date);
CREATE INDEX idx_payment_method_analytics_method ON public.payment_method_analytics(payment_method);

-- Enable RLS
ALTER TABLE public.ifood_detailed_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_method_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for now" ON public.ifood_detailed_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.payment_method_analytics FOR ALL USING (true);