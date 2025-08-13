import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';

export interface IfoodSyncStatus {
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'partial';
  lastSync?: string;
  count?: number;
}

export const useIfoodSyncStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<IfoodSyncStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSyncStatus = async () => {
    if (!user?.id) {
      setStatus([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Verificar se há token de acesso (Authentication)
      const { data: tokenData, error: tokenError } = await supabase
        .from('ifood_tokens')
        .select('access_token, created_at, updated_at')
        .eq('user_id', user.id)
        .single();


      // 2. Verificar se há merchants sincronizados (Merchant API)
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('ifood_merchants')
        .select('merchant_id, last_sync_at, updated_at')
        .eq('user_id', user.id);

      // 3. Verificar se há produtos sincronizados (Catalog API)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, updated_at')
        .in('merchant_id', merchantsData?.map(m => m.merchant_id) || []);

      // 4. Verificar se há dados financeiros (Financial API) - verificar se a tabela existe
      let financialData = null;
      let financialError = null;
      
      try {
        const { data, error } = await supabase
          .from('financial_data')
          .select('id, updated_at')
          .eq('user_id', user.id);
        financialData = data;
        financialError = error;
      } catch (error) {
        // Tabela pode não existir ainda, ignorar erro
        console.log('Tabela financial_data não encontrada, isso é normal');
        financialData = null;
        financialError = null;
      }

      const syncStatus: IfoodSyncStatus[] = [
        {
          name: 'Merchant API',
          description: 'Dados dos restaurantes e configurações',
          status: (merchantsData && merchantsData.length > 0 && !merchantsError) ? 'connected' : 'disconnected',
          lastSync: merchantsData?.[0]?.last_sync_at ? 
            formatLastSync(merchantsData[0].last_sync_at) : 
            merchantsData?.[0]?.updated_at ? formatLastSync(merchantsData[0].updated_at) : undefined,
          count: merchantsData?.length || 0
        },
        {
          name: 'Catalog API',
          description: 'Gestão do catálogo de produtos',
          status: (productsData && productsData.length > 0 && !productsError) ? 'connected' : 'disconnected',
          lastSync: productsData?.[0]?.updated_at ? 
            formatLastSync(productsData[0].updated_at) : undefined,
          count: productsData?.length || 0
        },
        {
          name: 'Financial API',
          description: 'Dados financeiros e faturamento',
          status: (financialData && financialData.length > 0 && !financialError) ? 'connected' : 'disconnected',
          lastSync: financialData?.[0]?.updated_at ? 
            formatLastSync(financialData[0].updated_at) : undefined,
          count: financialData?.length || 0
        }
      ];

      setStatus(syncStatus);
    } catch (error) {
      console.error('Erro ao verificar status de sincronização:', error);
      setStatus([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''} atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hora${hours !== 1 ? 's' : ''} atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dia${days !== 1 ? 's' : ''} atrás`;
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, [user?.id]);

  return {
    status,
    loading,
    refreshStatus: checkSyncStatus
  };
};