-- Criar tabela ifood_tokens se não existir
CREATE TABLE IF NOT EXISTS public.ifood_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  expires_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário tem apenas um token
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.ifood_tokens ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own tokens" 
  ON public.ifood_tokens FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" 
  ON public.ifood_tokens FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" 
  ON public.ifood_tokens FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ifood_tokens_user_id ON public.ifood_tokens(user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ifood_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_ifood_tokens_updated_at ON public.ifood_tokens;
CREATE TRIGGER trigger_update_ifood_tokens_updated_at
    BEFORE UPDATE ON public.ifood_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_ifood_tokens_updated_at();