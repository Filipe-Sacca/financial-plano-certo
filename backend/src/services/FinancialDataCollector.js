/**
 * 💰 Serviço de Coleta de Dados Financeiros do iFood
 *
 * IMPORTANTE:
 * - Sem dados mockados
 * - Token real obrigatório
 * - Baseado em merchant_id
 */

const { supabase } = require('../config/supabase');
const axios = require('axios');

class FinancialDataCollector {
  constructor() {
    this.supabase = supabase;

    this.ifoodBaseUrl = 'https://merchant-api.ifood.com.br';
    this.accessToken = null;
  }

  /**
   * Buscar token real do iFood (sem fallback para mock)
   */
  async getIfoodToken(merchantId) {
    try {
      console.log(`🔍 Buscando token para merchant: ${merchantId}`);

      // Buscar token válido no banco baseado em merchant_id
      const { data: tokenData, error } = await this.supabase
        .from('ifood_credentials')
        .select('access_token, refresh_token, expires_at')
        .eq('merchant_id', merchantId)
        .single();

      if (error || !tokenData) {
        throw new Error(`Token não encontrado para merchant ${merchantId}. Faça autenticação primeiro.`);
      }

      // Verificar se token expirou
      if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
        console.log('⚠️ Token expirado, tentando renovar...');
        return await this.refreshIfoodToken(tokenData.refresh_token, merchantId);
      }

      console.log('✅ Token válido encontrado');
      this.accessToken = tokenData.access_token;
      return this.accessToken;

    } catch (error) {
      console.error('❌ Erro ao obter token iFood:', error);
      throw error;
    }
  }

  /**
   * Renovar token OAuth2 do iFood
   */
  async refreshIfoodToken(refreshToken, merchantId) {
    try {
      const response = await fetch(`${this.ifoodBaseUrl}/authentication/v1.0/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'grant_type': 'refresh_token',
          'refresh_token': refreshToken,
          'client_id': process.env.IFOOD_CLIENT_ID,
          'client_secret': process.env.IFOOD_CLIENT_SECRET
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao renovar token: ${response.status}`);
      }

      const data = await response.json();

      // Atualizar token no banco
      const expiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

      await this.supabase
        .from('ifood_credentials')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken,
          expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('merchant_id', merchantId);

      console.log('✅ Token renovado com sucesso');
      this.accessToken = data.access_token;
      return this.accessToken;

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      throw error;
    }
  }

  /**
   * Buscar liquidações (settlements) com paginação
   */
  async collectSettlements(merchantId, startDate, endDate, page = 1, limit = 50) {
    try {
      await this.getIfoodToken(merchantId);

      console.log(`📊 Buscando settlements - Merchant: ${merchantId}, Página: ${page}`);

      const url = `${this.ifoodBaseUrl}/financial/v3.0/merchants/${merchantId}/settlements`;
      const params = new URLSearchParams({
        beginPaymentDate: startDate,
        endPaymentDate: endDate,
        page: page.toString(),
        size: limit.toString()
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Salvar no banco com merchant_id como chave
      if (data.settlements && data.settlements.length > 0) {
        await this.saveSettlementsToDatabase(data.settlements, merchantId);
      }

      return {
        data: data.settlements || [],
        pagination: {
          page,
          limit,
          total: data.totalElements || 0,
          hasMore: data.hasNext || false
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar settlements:', error);
      throw error;
    }
  }

  /**
   * Buscar eventos financeiros com paginação
   */
  async collectFinancialEvents(merchantId, startDate, endDate, eventType = null, page = 1, limit = 50) {
    try {
      await this.getIfoodToken(merchantId);

      console.log(`📊 Buscando eventos financeiros - Merchant: ${merchantId}, Página: ${page}`);

      const url = `${this.ifoodBaseUrl}/financial/v3.0/merchants/${merchantId}/financial-events`;
      const params = new URLSearchParams({
        beginPeriodDate: startDate,
        endPeriodDate: endDate,
        page: page.toString(),
        size: limit.toString()
      });

      if (eventType) {
        params.append('eventType', eventType);
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Salvar no banco com merchant_id como chave
      if (data.events && data.events.length > 0) {
        await this.saveEventsToDatabase(data.events, merchantId);
      }

      return {
        data: data.events || [],
        pagination: {
          page,
          limit,
          total: data.totalElements || 0,
          hasMore: data.hasNext || false
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      throw error;
    }
  }

  /**
   * Buscar vendas (sales) - Limitado a 7 dias pelo iFood
   */
  async collectSales(merchantId, startDate, endDate, page = 1, limit = 50) {
    try {
      await this.getIfoodToken(merchantId);

      // Validar período máximo de 7 dias
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        throw new Error('Período máximo para vendas é de 7 dias (limitação iFood)');
      }

      console.log(`🛒 Buscando vendas - Merchant: ${merchantId}, Página: ${page}`);

      const url = `${this.ifoodBaseUrl}/order/v1.0/merchants/${merchantId}/orders`;
      const params = new URLSearchParams({
        createdAt: `ge:${startDate}T00:00:00Z,le:${endDate}T23:59:59Z`,
        page: page.toString(),
        size: limit.toString()
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Salvar no banco com merchant_id como chave
      if (data.orders && data.orders.length > 0) {
        await this.saveSalesToDatabase(data.orders, merchantId);
      }

      return {
        data: data.orders || [],
        pagination: {
          page,
          limit,
          total: data.totalElements || 0,
          hasMore: data.hasNext || false
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      throw error;
    }
  }

  /**
   * Buscar antecipações
   */
  async collectAnticipations(merchantId, startDate, endDate) {
    try {
      await this.getIfoodToken(merchantId);

      console.log(`⚡ Buscando antecipações - Merchant: ${merchantId}`);

      const url = `${this.ifoodBaseUrl}/financial/v3.0/merchants/${merchantId}/anticipations`;
      const params = new URLSearchParams({
        beginCalculationDate: startDate,
        endCalculationDate: endDate
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Salvar no banco com merchant_id como chave
      if (data.anticipations && data.anticipations.length > 0) {
        await this.saveAnticipationsToDatabase(data.anticipations, merchantId);
      }

      return data.anticipations || [];

    } catch (error) {
      console.error('❌ Erro ao buscar antecipações:', error);
      throw error;
    }
  }

  /**
   * Buscar reconciliação
   */
  async collectReconciliation(merchantId, competence) {
    try {
      await this.getIfoodToken(merchantId);

      console.log(`📁 Buscando reconciliação - Merchant: ${merchantId}, Competência: ${competence}`);

      const url = `${this.ifoodBaseUrl}/financial/v3.0/merchants/${merchantId}/reconciliation`;
      const params = new URLSearchParams({
        competence: competence
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Salvar no banco com merchant_id como chave
      if (data.files && data.files.length > 0) {
        await this.saveReconciliationToDatabase(data.files, merchantId, competence);
      }

      return data.files || [];

    } catch (error) {
      console.error('❌ Erro ao buscar reconciliação:', error);
      throw error;
    }
  }

  /**
   * Gerar reconciliação sob demanda
   */
  async generateReconciliationOnDemand(merchantId, competence) {
    try {
      await this.getIfoodToken(merchantId);

      console.log(`📝 Gerando reconciliação sob demanda - Merchant: ${merchantId}`);

      const url = `${this.ifoodBaseUrl}/financial/v3.0/merchants/${merchantId}/reconciliation/on-demand`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          competence: competence
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Erro ao gerar reconciliação:', error);
      throw error;
    }
  }

  /**
   * Verificar status de reconciliação por request ID
   */
  async getReconciliationStatus(merchantId, requestId) {
    try {
      await this.getIfoodToken(merchantId);

      console.log(`🔍 Verificando status reconciliação - RequestID: ${requestId}`);

      const url = `${this.ifoodBaseUrl}/financial/v3.0/merchants/${merchantId}/reconciliation/on-demand/${requestId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      throw error;
    }
  }

  /**
   * Salvar settlements no banco (baseado em merchant_id)
   */
  async saveSettlementsToDatabase(settlements, merchantId) {
    try {
      const dataToSave = settlements.map(s => ({
        merchant_id: merchantId,
        settlement_id: s.settlementId || s.id,
        settlement_type: s.settlementType || s.type,
        amount: s.amount,
        status: s.status,
        payment_date: s.paymentDate,
        calculation_start_date: s.calculationStartDate,
        calculation_end_date: s.calculationEndDate,
        bank_name: s.bankName,
        bank_number: s.bankNumber,
        transaction_id: s.transactionId,
        raw_data: s,
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('financial_settlements')
        .upsert(dataToSave, {
          onConflict: 'merchant_id,settlement_id'
        });

      if (error) throw error;

      console.log(`✅ ${settlements.length} settlements salvos no banco`);
      return dataToSave;

    } catch (error) {
      console.error('Erro ao salvar settlements:', error);
      throw error;
    }
  }

  /**
   * Salvar eventos no banco (baseado em merchant_id)
   */
  async saveEventsToDatabase(events, merchantId) {
    try {
      const dataToSave = events.map(e => ({
        merchant_id: merchantId,
        event_name: e.eventName,
        event_description: e.eventDescription,
        product: e.product || 'IFOOD',
        trigger_type: e.triggerType,
        competence: e.competence,
        reference_type: e.referenceType,
        reference_id: e.referenceId,
        reference_date: e.referenceDate,
        amount: e.amount,
        base_value: e.baseValue,
        fee_percentage: e.feePercentage,
        has_transfer_impact: e.hasTransferImpact,
        expected_settlement_date: e.expectedSettlementDate,
        payment_method: e.paymentMethod,
        payment_brand: e.paymentBrand,
        payment_liability: e.paymentLiability,
        period_start_date: e.periodStartDate,
        period_end_date: e.periodEndDate,
        raw_data: e,
        created_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('financial_events')
        .upsert(dataToSave, {
          onConflict: 'merchant_id,reference_id,event_name,period_start_date'
        });

      if (error) throw error;

      console.log(`✅ ${events.length} eventos salvos no banco`);
      return dataToSave;

    } catch (error) {
      console.error('Erro ao salvar eventos:', error);
      throw error;
    }
  }

  /**
   * Salvar vendas no banco (baseado em merchant_id)
   */
  async saveSalesToDatabase(sales, merchantId) {
    try {
      const dataToSave = sales.map(s => ({
        merchant_id: merchantId,
        order_id: s.id || s.orderId,
        created_at: s.createdAt,
        status: s.status,
        payment_method: s.payments?.[0]?.method,
        total_amount: s.total?.value || s.totalValue,
        total_gross_value: s.total?.grossValue,
        primary_payment_method: s.payments?.[0]?.type,
        current_status: s.status,
        details: s,
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('financial_sales')
        .upsert(dataToSave, {
          onConflict: 'merchant_id,order_id'
        });

      if (error) throw error;

      console.log(`✅ ${sales.length} vendas salvas no banco`);
      return dataToSave;

    } catch (error) {
      console.error('Erro ao salvar vendas:', error);
      throw error;
    }
  }

  /**
   * Salvar antecipações no banco (baseado em merchant_id)
   */
  async saveAnticipationsToDatabase(anticipations, merchantId) {
    try {
      const dataToSave = anticipations.map(a => ({
        merchant_id: merchantId,
        begin_date: a.beginDate,
        end_date: a.endDate,
        balance: a.balance,
        anticipation_data: a,
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('financial_anticipations')
        .upsert(dataToSave, {
          onConflict: 'merchant_id,begin_date,end_date'
        });

      if (error) throw error;

      console.log(`✅ ${anticipations.length} antecipações salvas no banco`);
      return dataToSave;

    } catch (error) {
      console.error('Erro ao salvar antecipações:', error);
      throw error;
    }
  }

  /**
   * Salvar reconciliações no banco (baseado em merchant_id)
   */
  async saveReconciliationToDatabase(files, merchantId, competence) {
    try {
      const dataToSave = files.map(f => ({
        merchant_id: merchantId,
        competence: competence,
        download_path: f.downloadPath,
        created_at_file: f.createdAt,
        metadata: f.metadata,
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('financial_reconciliation')
        .upsert(dataToSave, {
          onConflict: 'merchant_id,competence'
        });

      if (error) throw error;

      console.log(`✅ ${files.length} reconciliações salvas no banco`);
      return dataToSave;

    } catch (error) {
      console.error('Erro ao salvar reconciliações:', error);
      throw error;
    }
  }
}

module.exports = FinancialDataCollector;