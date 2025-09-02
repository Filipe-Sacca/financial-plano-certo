import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';

export interface UserPausedProduct {
  id: string;
  client_id: string;
  item_id: string | null;
  name: string;
  category: string | null;
  price: number | null;
  description: string | null;
  is_active: 'AVAILABLE' | 'UNAVAILABLE' | null;
  created_at: string;
  updated_at: string;
  merchant_id: string | null;
  imagePath: string | null;
  product_id: string | null;
  ifood_product_id: string | null;
}

export interface PausedProductsGroup {
  merchantId: string;
  merchantName: string;
  pausedProducts: UserPausedProduct[];
  totalPaused: number;
}

/**
 * Hook para buscar APENAS produtos PAUSADOS do banco de dados
 * Filtra produtos com is_active = 'UNAVAILABLE' diretamente na query
 */
export const useUserPausedProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Primeiro, busca os merchant_ids das lojas do usuário
  const { data: userMerchants } = useQuery({
    queryKey: ['user-merchants', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('ifood_merchants')
        .select('merchant_id, name')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutos para merchant data
  });

  // Busca APENAS produtos pausados do banco de dados
  const pausedProductsQuery = useQuery({
    queryKey: ['user-paused-products', user?.id, userMerchants?.map(m => m.merchant_id)],
    queryFn: async () => {
      if (!userMerchants || userMerchants.length === 0) return [];

      const merchantIds = userMerchants.map(m => m.merchant_id);

      console.log('🔍 Buscando produtos pausados do banco de dados...');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('merchant_id', merchantIds)
        .eq('is_active', 'UNAVAILABLE') // ✅ FILTRO: Apenas produtos pausados
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar produtos pausados:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} produtos pausados no banco`);
      return data as UserPausedProduct[];
    },
    enabled: !!user?.id && !!userMerchants && userMerchants.length > 0,
    refetchInterval: 5 * 60 * 1000, // 5 minutos de polling automático
    staleTime: 4 * 60 * 1000, // Dados ficam "stale" após 4 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Agrupa produtos pausados por loja
  const groupedPausedProducts: PausedProductsGroup[] = [];
  
  if (pausedProductsQuery.data && userMerchants) {
    const pausedByMerchant = pausedProductsQuery.data.reduce((acc, product) => {
      const merchantId = product.merchant_id;
      if (!merchantId) return acc;

      if (!acc[merchantId]) {
        acc[merchantId] = [];
      }
      acc[merchantId].push(product);
      return acc;
    }, {} as Record<string, UserPausedProduct[]>);

    Object.entries(pausedByMerchant).forEach(([merchantId, pausedProducts]) => {
      const merchant = userMerchants.find(m => m.merchant_id === merchantId);
      
      groupedPausedProducts.push({
        merchantId,
        merchantName: merchant?.name || merchantId,
        pausedProducts,
        totalPaused: pausedProducts.length,
      });
    });
  }

  // Função para forçar atualização manual
  const forceRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['user-paused-products'] });
  };

  return {
    pausedProducts: pausedProductsQuery.data || [],
    groupedPausedProducts,
    merchants: userMerchants || [],
    isLoading: pausedProductsQuery.isLoading,
    error: pausedProductsQuery.error,
    refetch: pausedProductsQuery.refetch,
    forceRefresh,
    lastUpdated: pausedProductsQuery.dataUpdatedAt,
    isRefetching: pausedProductsQuery.isRefetching,
    totalPausedProducts: pausedProductsQuery.data?.length || 0,
  };
};

/**
 * Hook para estatísticas de produtos pausados do usuário
 */
export const useUserPausedProductsStats = () => {
  const { pausedProducts, isLoading, error } = useUserPausedProducts();

  const stats = {
    totalPausedProducts: 0,
    averagePausedPrice: 0,
    totalPausedValue: 0,
    storesWithPausedProducts: 0,
    pausedByCategory: {} as Record<string, number>,
  };

  if (pausedProducts && pausedProducts.length > 0) {
    stats.totalPausedProducts = pausedProducts.length;
    
    const pausedWithPrice = pausedProducts.filter(p => p.price && p.price > 0);
    stats.totalPausedValue = pausedWithPrice.reduce((sum, p) => sum + (p.price || 0), 0);
    stats.averagePausedPrice = pausedWithPrice.length > 0 ? stats.totalPausedValue / pausedWithPrice.length : 0;
    
    const uniqueStores = new Set(pausedProducts.map(p => p.merchant_id).filter(Boolean));
    stats.storesWithPausedProducts = uniqueStores.size;

    // Agrupa por categoria
    pausedProducts.forEach(product => {
      const category = product.category || 'Sem categoria';
      stats.pausedByCategory[category] = (stats.pausedByCategory[category] || 0) + 1;
    });
  }

  return {
    ...stats,
    isLoading,
    error,
  };
};