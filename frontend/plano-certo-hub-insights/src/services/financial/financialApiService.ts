/**
 * 💰 Serviço de API Financeira
 *
 * Comunicação com endpoints financeiros do backend
 * SEM dados mockados - apenas real API
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://5.161.109.157:3000';

// Configuração do axios com interceptors
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/financial`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.error('Token inválido. Faça autenticação primeiro.');
      // Redirecionar para login se necessário
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Tipos TypeScript para as respostas
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface Settlement {
  id: string;
  merchant_id: string;
  amount: number;
  status: string;
  settlement_date: string;
  type: string;
  description?: string;
}

export interface FinancialEvent {
  id: string;
  merchant_id: string;
  event_name: string;
  event_description: string;
  amount: number;
  competence: string;
  reference_id: string;
  reference_date: string;
  payment_method?: string;
  expected_settlement_date?: string;
}

export interface Sale {
  id: string;
  order_id: string;
  merchant_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  details?: any;
}

export interface Anticipation {
  id: string;
  merchant_id: string;
  begin_date: string;
  end_date: string;
  balance: number;
  status?: string;
  anticipation_data: any;
}

export interface ReconciliationData {
  competence: string;
  download_path: string;
  created_at_file: string;
  metadata?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  filters?: any;
  error?: string;
}

// Serviço de API Financeira
class FinancialApiService {
  /**
   * Buscar settlements com paginação
   */
  async getSettlements(
    merchantId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<Settlement[]>> {
    try {
      const response = await apiClient.get('/settlements', {
        params: {
          merchant_id: merchantId,
          ...params,
        },
      });
      return response as ApiResponse<Settlement[]>;
    } catch (error) {
      console.error('Erro ao buscar settlements:', error);
      throw error;
    }
  }

  /**
   * Buscar eventos financeiros
   */
  async getFinancialEvents(
    merchantId: string,
    params?: PaginationParams & DateRangeParams & { event_type?: string }
  ): Promise<ApiResponse<FinancialEvent[]>> {
    try {
      const response = await apiClient.get('/events', {
        params: {
          merchant_id: merchantId,
          ...params,
        },
      });
      return response as ApiResponse<FinancialEvent[]>;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  }

  /**
   * Buscar vendas (últimos 7 dias)
   */
  async getSales(
    merchantId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<Sale[]>> {
    try {
      const response = await apiClient.get('/sales', {
        params: {
          merchant_id: merchantId,
          ...params,
        },
      });
      return response as ApiResponse<Sale[]>;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  /**
   * Buscar antecipações
   */
  async getAnticipations(
    merchantId: string,
    params?: PaginationParams & DateRangeParams & { status?: string }
  ): Promise<ApiResponse<Anticipation[]>> {
    try {
      const response = await apiClient.get('/anticipations', {
        params: {
          merchant_id: merchantId,
          ...params,
        },
      });
      return response as ApiResponse<Anticipation[]>;
    } catch (error) {
      console.error('Erro ao buscar antecipações:', error);
      throw error;
    }
  }

  /**
   * Buscar dados de reconciliação
   */
  async getReconciliation(
    merchantId: string,
    startDate: string,
    endDate: string,
    params?: PaginationParams
  ): Promise<ApiResponse<ReconciliationData[]>> {
    try {
      const response = await apiClient.get('/reconciliation', {
        params: {
          merchant_id: merchantId,
          start_date: startDate,
          end_date: endDate,
          ...params,
        },
      });
      return response as ApiResponse<ReconciliationData[]>;
    } catch (error) {
      console.error('Erro ao buscar reconciliação:', error);
      throw error;
    }
  }

  /**
   * Solicitar reconciliação sob demanda
   */
  async requestOnDemandReconciliation(
    merchantId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<{ requestId: string }>> {
    try {
      const response = await apiClient.post('/reconciliation/on-demand', {
        merchant_id: merchantId,
        start_date: startDate,
        end_date: endDate,
      });
      return response as ApiResponse<{ requestId: string }>;
    } catch (error) {
      console.error('Erro ao solicitar reconciliação:', error);
      throw error;
    }
  }

  /**
   * Verificar status de reconciliação sob demanda
   */
  async checkOnDemandStatus(
    merchantId: string,
    requestId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(
        `/reconciliation/on-demand/${requestId}`,
        {
          params: {
            merchant_id: merchantId,
          },
        }
      );
      return response as ApiResponse<any>;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }

  /**
   * Buscar resumo financeiro
   */
  async getFinancialSummary(
    merchantId: string,
    params?: DateRangeParams
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/summary', {
        params: {
          merchant_id: merchantId,
          ...params,
        },
      });
      return response as ApiResponse<any>;
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      throw error;
    }
  }

  /**
   * Verificar saúde do serviço financeiro
   */
  async checkHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/health');
      return response as ApiResponse<any>;
    } catch (error) {
      console.error('Erro ao verificar saúde:', error);
      throw error;
    }
  }
}

// Exportar instância única
export const financialApiService = new FinancialApiService();
export default financialApiService;