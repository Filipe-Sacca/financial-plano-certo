
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type ImportLog = Tables<'import_logs'>;
type ImportLogInsert = TablesInsert<'import_logs'>;

export const useImportLogs = (clientId?: string) => {
  return useQuery({
    queryKey: ['import_logs', clientId],
    queryFn: async () => {
      let query = supabase
        .from('import_logs')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId && clientId !== 'all') {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      
      if (error) {
        toast.error('Erro ao carregar logs de importação');
        throw error;
      }
      
      return data;
    },
  });
};

export const useCreateImportLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: ImportLogInsert) => {
      const { data, error } = await supabase
        .from('import_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import_logs'] });
    },
    onError: (error) => {
      console.error('Erro ao criar log:', error);
      toast.error('Erro ao registrar importação');
    },
  });
};

export const useUpdateImportLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ImportLog>) => {
      const { data, error } = await supabase
        .from('import_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import_logs'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar log:', error);
    },
  });
};
