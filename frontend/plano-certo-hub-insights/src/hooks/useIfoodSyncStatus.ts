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
    console.log('🔍 [SYNC STATUS] Verificando status de sincronização...');
    console.log('👤 [SYNC STATUS] User ID:', user?.id);
    
    if (!user?.id) {
      console.log('⚠️ [SYNC STATUS] Usuário não autenticado, limpando status');
      setStatus([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 [SYNC STATUS] Iniciando verificação de status...');
      setLoading(true);

      console.log('🔍 [STEP 1] Verificando token de acesso...');
      // 1. Verificar se há token de acesso (Authentication)
      const { data: tokenData, error: tokenError } = await supabase
        .from('ifood_tokens')
        .select('access_token, created_at, token_updated_at')
        .eq('user_id', user.id)
        .single();
        
      console.log('📊 [TOKEN CHECK] Token encontrado:', !!tokenData);
      console.log('❌ [TOKEN CHECK] Erro token:', tokenError?.message || 'Nenhum');


      console.log('🔍 [STEP 2] Verificando merchants sincronizados...');
      // 2. Verificar se há merchants sincronizados (Merchant API)
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('ifood_merchants')
        .select('merchant_id, last_sync_at, updated_at')
        .eq('user_id', user.id);
        
      console.log('🏪 [MERCHANT CHECK] Merchants encontrados:', merchantsData?.length || 0);
      console.log('❌ [MERCHANT CHECK] Erro merchants:', merchantsError?.message || 'Nenhum');

      console.log('🔍 [STEP 3] Verificando produtos sincronizados...');
      // 3. Verificar se há produtos sincronizados (Catalog API)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, updated_at')
        .in('merchant_id', merchantsData?.map(m => m.merchant_id) || []);
        
      console.log('📦 [PRODUCT CHECK] Produtos encontrados:', productsData?.length || 0);
      console.log('❌ [PRODUCT CHECK] Erro produtos:', productsError?.message || 'Nenhum');

      // 4. Verificar se há dados financeiros (Financial API) - TEMPORARIAMENTE DESABILITADO
      // A tabela financial_data ainda não foi criada no Supabase
      let financialData = null;
      let financialError = null;
      
      console.log('🔍 [STEP 4] Verificando dados financeiros...');
      console.log('⚠️ [FINANCIAL CHECK] Tabela financial_data ainda não implementada - pulando verificação');
      
      // TODO: Descomentar quando a tabela financial_data for criada no Supabase
      /*
      try {
        const { data, error } = await supabase
          .from('financial_data')
          .select('id, updated_at')
          .eq('user_id', user.id);
        financialData = data;
        financialError = error;
        
        if (error) {
          console.log('⚠️ [FINANCIAL CHECK] Erro:', error.message);
          if (error.code === '42P01') {
            console.log('📋 [FINANCIAL CHECK] Tabela financial_data não existe - isso é normal');
            financialError = null;
          }
        } else {
          console.log('💰 [FINANCIAL CHECK] Dados financeiros encontrados:', data?.length || 0);
        }
      } catch (error) {
        console.log('⚠️ [FINANCIAL CHECK] Tabela financial_data não encontrada, isso é normal');
        financialData = null;
        financialError = null;
      }
      */

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
          description: 'Dados financeiros e faturamento (em desenvolvimento)',
          status: 'disconnected', // Temporariamente desabilitado
          lastSync: undefined,
          count: 0
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