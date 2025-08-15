import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Interface para a tabela ifood_tokens
interface IfoodToken {
  access_token: string;
  client_id: string;
  client_secret: string;
  expires_at: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useIfoodConfig = (userId?: string) => {
  return useQuery<IfoodToken | null>({
    queryKey: ['ifood_config', userId],
    queryFn: async () => {
      if (!userId) {
        logger.debug('🔍 [useIfoodConfig] UserId não fornecido');
        return null;
      }
      
      logger.debug('🔍 [useIfoodConfig] Buscando token para userId:', userId);
      
      // Primeiro, verificar se existem tokens na tabela
      const { data: allTokens, error: allError } = await supabase
        .from('ifood_tokens')
        .select('user_id, access_token, client_id, expires_at');
      
      logger.debug('🔍 [useIfoodConfig] Todos os tokens na tabela:', allTokens);
      if (allError) {
        console.error('❌ [useIfoodConfig] Erro ao buscar todos os tokens:', allError);
      }
      
      // Agora buscar o token específico do usuário
      const { data, error } = await supabase
        .from('ifood_tokens')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      logger.debug('🔍 [useIfoodConfig] Resultado da busca específica:', {
        data,
        error,
        userId
      });

      if (error) {
        console.error('❌ [useIfoodConfig] Erro ao buscar configuração do iFood:', error);
        return null;
      }

      if (!data) {
        logger.debug('⚠️ [useIfoodConfig] Nenhum token encontrado para o usuário:', userId);
        return null;
      }

      logger.debug('✅ [useIfoodConfig] Token encontrado:', {
        hasAccessToken: !!data.access_token,
        clientId: data.client_id,
        expiresAt: data.expires_at
      });

      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false
  });
}; 