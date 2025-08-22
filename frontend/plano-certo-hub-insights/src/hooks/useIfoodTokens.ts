import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenData {
  user_id: string;
  client_id: string;
  access_token: string;
  expires_at: string;
  created_at: string;
}

export const useIfoodTokens = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ifood_tokens')
        .select('user_id, client_id, access_token, expires_at, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Filtrar apenas tokens válidos (não expirados)
      // expires_at é timestamp Unix em segundos
      const nowTimestamp = Math.floor(Date.now() / 1000);
      const validTokens = data?.filter(token => {
        const expiresAtTimestamp = typeof token.expires_at === 'string' 
          ? parseInt(token.expires_at) 
          : token.expires_at;
        return expiresAtTimestamp > nowTimestamp;
      }) || [];

      setTokens(validTokens);
      
      console.log('📊 Tokens válidos encontrados:', validTokens.length);
      validTokens.forEach((token, index) => {
        console.log(`${index + 1}. User ID: ${token.user_id} | Client ID: ${token.client_id}`);
      });

    } catch (err: any) {
      console.error('❌ Erro ao buscar tokens:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar token específico para um user_id
  const getTokenForUser = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('ifood_tokens')
        .select('access_token, expires_at')
        .eq('user_id', userId)
        .single();

      if (error || !data?.access_token) {
        console.error('❌ Token não encontrado para user_id:', userId);
        return null;
      }

      // Verificar se token está expirado (expires_at é timestamp Unix em segundos)
      const expiresAtTimestamp = typeof data.expires_at === 'string' 
        ? parseInt(data.expires_at) 
        : data.expires_at;
      const nowTimestamp = Math.floor(Date.now() / 1000);
      
      const isExpired = expiresAtTimestamp <= nowTimestamp;
      
      console.log(`🕐 Token expires at: ${expiresAtTimestamp}, now: ${nowTimestamp}, expired: ${isExpired}`);
      console.log(`📅 Token expiry date: ${new Date(expiresAtTimestamp * 1000).toISOString()}`);
      
      if (isExpired) {
        const expiryDate = new Date(expiresAtTimestamp * 1000);
        console.error('❌ Token expirado para user_id:', userId);
        console.error(`📅 Token expirou em: ${expiryDate.toISOString()}`);
        console.error(`⏰ Tempo desde expiração: ${Math.floor((nowTimestamp - expiresAtTimestamp) / 60)} minutos`);
        return null;
      }

      return data.access_token;
    } catch (error) {
      console.error('❌ Erro ao buscar token específico:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return {
    tokens,
    isLoading,
    error,
    refetch: fetchTokens,
    getTokenForUser
  };
};