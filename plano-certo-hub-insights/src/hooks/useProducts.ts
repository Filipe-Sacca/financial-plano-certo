
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProducts = (clientId?: string, merchantId?: string) => {
  return useQuery({
    queryKey: ['products', clientId, merchantId],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      if (merchantId) {
        query = query.eq('merchant_id', merchantId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId || !!merchantId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useCreateProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (products: any[]) => {
      const { data, error } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'client_id,name' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useProductsByMerchant = (merchantId: string, clientId?: string) => {
  return useQuery({
    queryKey: ['products-by-merchant', merchantId, clientId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId);
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!merchantId,
  });
};
