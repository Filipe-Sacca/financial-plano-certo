
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';

type FinancialMetric = Tables<'financial_metrics'>;
type FinancialMetricInsert = TablesInsert<'financial_metrics'>;

export const useFinancialMetrics = (clientId?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['financial_metrics', clientId, dateRange],
    queryFn: async () => {
      logger.debug('🔍 Buscando métricas financeiras com parâmetros:', { clientId, dateRange });
      
      let query = supabase
        .from('financial_metrics')
        .select(`
          *,
          clients (
            name,
            city,
            state
          )
        `)
        .order('date', { ascending: false });

      if (clientId && clientId !== 'all') {
        query = query.eq('client_id', clientId);
      }

      if (dateRange) {
        logger.debug('📅 Aplicando filtro de data:', dateRange);
        query = query
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao carregar métricas financeiras:', error);
        toast.error('Erro ao carregar métricas financeiras');
        throw error;
      }
      
      logger.debug('✅ Métricas financeiras carregadas:', data?.length, 'registros');
      logger.debug('📊 Dados carregados:', data?.slice(0, 3)); // Log dos primeiros 3 registros
      
      return data;
    },
  });
};

export const useCreateFinancialMetrics = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metrics: FinancialMetricInsert[]) => {
      const { data, error } = await supabase
        .from('financial_metrics')
        .upsert(metrics, { onConflict: 'client_id,date' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial_metrics'] });
      toast.success(`${data.length} registros financeiros salvos com sucesso!`);
    },
    onError: (error) => {
      console.error('Erro ao salvar métricas:', error);
      toast.error('Erro ao salvar métricas financeiras');
    },
  });
};
