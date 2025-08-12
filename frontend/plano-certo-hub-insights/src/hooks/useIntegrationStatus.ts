import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { differenceInHours, parseISO } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

export interface IntegrationStatus {
  id: number;
  service: string;
  status: string;
  last_sync: string;
  message?: string;
}

export function useIntegrationStatus(service: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('integration_status')
        .select('*')
        .eq('service', service)
        .single();
      if (error) throw error;
      setStatus(data);
      return data as IntegrationStatus;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar status');
      setStatus(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    error,
    fetchStatus,
  };
}

// Tipagem da tabela ifood_tokens
export type IfoodToken = {
  access_token: string;
  client_id: string;
  client_secret: string;
  expires_at: number;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export interface IfoodTokenStatus {
  client_id: string;
  updated_at: string;
  is_valid: boolean;
  hours_since_update: number;
  expires_at?: number | null;
}

export const useIfoodTokenStatus = () => {
  return useQuery<IfoodTokenStatus[]>({
    queryKey: ['ifood_token_status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ifood_tokens')
        .select('*');
      if (error) throw error;
      if (!data) return [];
      const now = new Date();
      return data.map((row) => {
        const updatedAt = parseISO(row.updated_at);
        const hours = differenceInHours(now, updatedAt);
        return {
          client_id: row.client_id,
          updated_at: row.updated_at,
          is_valid: hours < 3,
          hours_since_update: hours,
          expires_at: row.expires_at,
        };
      });
    },
  });
}; 