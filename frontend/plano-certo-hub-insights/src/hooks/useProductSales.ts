
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductSales = (clientId?: string) => {
  return useQuery({
    queryKey: ['product_sales', clientId],
    queryFn: async () => {
      let query = supabase
        .from('product_sales')
        .select(`
          *,
          products (
            name,
            category
          )
        `);
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
};

export const useCreateProductSales = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sales: any[]) => {
      const { data, error } = await supabase
        .from('product_sales')
        .upsert(sales, { onConflict: 'client_id,product_id,date' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_sales'] });
    },
  });
};
