
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMenuFunnel = (selectedClient?: string) => {
  return useQuery({
    queryKey: ['menu-funnel', selectedClient],
    queryFn: async () => {
      let query = supabase
        .from('menu_funnel')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('date', { ascending: false });

      if (selectedClient && selectedClient !== 'all') {
        query = query.eq('client_id', selectedClient);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching menu funnel data:', error);
        throw error;
      }

      return data || [];
    },
  });
};
