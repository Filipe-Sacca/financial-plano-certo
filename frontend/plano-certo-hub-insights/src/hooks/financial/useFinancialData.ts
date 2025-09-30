/**
 * 🪝 Hooks customizados para dados financeiros
 *
 * React hooks para buscar e gerenciar dados financeiros
 * com paginação, cache e loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import financialApiService, {
  PaginationParams,
  DateRangeParams,
  ApiResponse,
  Settlement,
  FinancialEvent,
  Sale,
  Anticipation,
  ReconciliationData,
} from '@/services/financial/financialApiService';

// Hook para buscar settlements
export function useSettlements(merchantId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['settlements', merchantId, params],
    queryFn: () => financialApiService.getSettlements(merchantId, params),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

// Hook para buscar eventos financeiros
export function useFinancialEvents(
  merchantId: string,
  params?: PaginationParams & DateRangeParams & { event_type?: string }
) {
  return useQuery({
    queryKey: ['financial-events', merchantId, params],
    queryFn: () => financialApiService.getFinancialEvents(merchantId, params),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para buscar vendas
export function useSales(merchantId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: ['sales', merchantId, params],
    queryFn: () => financialApiService.getSales(merchantId, params),
    enabled: !!merchantId,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
  });
}

// Hook para buscar antecipações
export function useAnticipations(
  merchantId: string,
  params?: PaginationParams & DateRangeParams & { status?: string }
) {
  return useQuery({
    queryKey: ['anticipations', merchantId, params],
    queryFn: () => financialApiService.getAnticipations(merchantId, params),
    enabled: !!merchantId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar reconciliação
export function useReconciliation(
  merchantId: string,
  startDate: string,
  endDate: string,
  params?: PaginationParams
) {
  return useQuery({
    queryKey: ['reconciliation', merchantId, startDate, endDate, params],
    queryFn: () =>
      financialApiService.getReconciliation(merchantId, startDate, endDate, params),
    enabled: !!merchantId && !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

// Hook para solicitar reconciliação sob demanda
export function useRequestReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      merchantId,
      startDate,
      endDate,
    }: {
      merchantId: string;
      startDate: string;
      endDate: string;
    }) =>
      financialApiService.requestOnDemandReconciliation(
        merchantId,
        startDate,
        endDate
      ),
    onSuccess: () => {
      // Invalidar cache de reconciliação
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    },
  });
}

// Hook para verificar status de reconciliação
export function useReconciliationStatus(
  merchantId: string,
  requestId: string,
  enabled = false
) {
  return useQuery({
    queryKey: ['reconciliation-status', merchantId, requestId],
    queryFn: () => financialApiService.checkOnDemandStatus(merchantId, requestId),
    enabled: enabled && !!merchantId && !!requestId,
    refetchInterval: 5000, // Verificar a cada 5 segundos
  });
}

// Hook para resumo financeiro
export function useFinancialSummary(
  merchantId: string,
  params?: DateRangeParams
) {
  return useQuery({
    queryKey: ['financial-summary', merchantId, params],
    queryFn: () => financialApiService.getFinancialSummary(merchantId, params),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para paginação genérica
export function usePaginatedData<T>(
  fetchFn: (params: PaginationParams) => Promise<ApiResponse<T[]>>,
  queryKey: any[]
) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [allData, setAllData] = useState<T[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => fetchFn({ page, limit }),
  });

  // Acumular dados para scroll infinito
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData((prev) => [...prev, ...data.data]);
      }
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (data?.pagination?.hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [data]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
  }, []);

  return {
    data: allData,
    page,
    limit,
    setLimit,
    hasMore: data?.pagination?.hasMore || false,
    isLoading,
    error,
    loadMore,
    reset,
    refetch,
  };
}

// Hook para filtros de data
export function useDateRangeFilter(defaultDays = 30) {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - defaultDays);

    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  });

  const setPresetRange = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setDateRange({
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    });
  }, []);

  const setCustomRange = useCallback((start: Date, end: Date) => {
    setDateRange({
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    });
  }, []);

  return {
    dateRange,
    setPresetRange,
    setCustomRange,
  };
}

// Hook para status de saúde do serviço
export function useFinancialHealth() {
  return useQuery({
    queryKey: ['financial-health'],
    queryFn: () => financialApiService.checkHealth(),
    refetchInterval: 60000, // Verificar a cada minuto
  });
}

// Hook para merchant ativo
export function useActiveMerchant() {
  const [merchantId, setMerchantId] = useState<string>(() => {
    // Recuperar do localStorage ou contexto
    return localStorage.getItem('activeMerchantId') || '';
  });

  const updateMerchant = useCallback((id: string) => {
    setMerchantId(id);
    localStorage.setItem('activeMerchantId', id);
  }, []);

  return {
    merchantId,
    setMerchantId: updateMerchant,
  };
}