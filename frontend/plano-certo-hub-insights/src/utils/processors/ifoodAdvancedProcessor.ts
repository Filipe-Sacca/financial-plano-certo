import { parseMoneyValue } from './valueParser';
import { ifoodColumnMap, findColumnValue, validateColumnMapping } from './ifoodColumnMapper';
import { parseIfoodDate } from './simpleDateParser';

export interface IfoodAdvancedAnalytics {
  client_id: string;
  date: string;
  order_number: string;
  billing_type: string;
  order_date: string;
  payment_date: string;
  payment_origin: string;
  
  // Valores financeiros
  items_value: number;
  delivery_fee: number;
  service_fee: number;
  gross_revenue: number;
  
  // Promoções e incentivos
  ifood_promotions: number;
  store_promotions: number;
  
  // Comissões
  ifood_commission_value: number;
  transaction_commission: number;
  weekly_plan_fee: number;
  
  // Valores finais
  net_value: number;
  source: string;
}

export interface ConsolidatedAnalytics {
  // Pedidos
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  dailyOrders: Record<string, number>;
  weeklyOrders: Record<string, number>;
  bestOrderDay: { date: string; count: number };
  
  // Faturamento
  totalRevenue: number;
  dailyRevenue: Record<string, number>;
  weeklyRevenue: Record<string, number>;
  
  // Ticket Médio
  monthlyAverageTicket: number;
  dailyAverageTicket: Record<string, number>;
  weeklyAverageTicket: Record<string, number>;
  
  // Formas de Pagamento
  paymentMethods: Record<string, {
    orders: number;
    ordersPercentage: number;
    revenue: number;
    revenuePercentage: number;
  }>;
  
  // Incentivos
  totalIfoodPromotions: number;
  totalStorePromotions: number;
  
  // Comissões
  totalIfoodCommission: number;
  totalTransactionCommission: number;
  totalWeeklyPlanFee: number;
  
  // Net values
  totalNetRevenue: number;
}

export const processIfoodAdvancedData = (data: any[], clientId: string) => {
  const detailedData: IfoodAdvancedAnalytics[] = [];
  const errors: any[] = [];

  console.log('=== PROCESSAMENTO AVANÇADO IFOOD ===');
  console.log('📊 Total de linhas:', data.length);
  
  if (data.length === 0) {
    console.error('❌ Nenhum dado recebido!');
    return { detailedData: [], consolidatedAnalytics: null, errors: [{ error: 'Nenhum dado recebido' }] };
  }

  const headers = Object.keys(data[0] || {});
  console.log('📋 Headers encontrados:', headers);
  
  // Validar mapeamento de colunas
  const { foundColumns, missingColumns } = validateColumnMapping(headers);
  console.log('✅ Colunas encontradas:', foundColumns);
  console.log('❌ Colunas faltando:', missingColumns);

  let totalCancellations = 0;
  let totalValidOrders = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      const billingType = findColumnValue(row, 'billingType') || '';
      const orderNumber = findColumnValue(row, 'orderNumber');
      
      if (!orderNumber || orderNumber === '' || orderNumber === null) {
        continue;
      }

      // Verificar se é cancelamento
      const isCancellation = billingType && (
        String(billingType).toLowerCase().includes('cancelad') ||
        String(billingType).toLowerCase().includes('cancel') ||
        String(billingType).toLowerCase().includes('estorn') ||
        String(billingType).toLowerCase().includes('débito') ||
        String(billingType).toLowerCase().includes('debito')
      );

      if (isCancellation) {
        totalCancellations++;
      }

      // Processar todos os pedidos (incluindo cancelamentos para análise completa)
      const rawOrderDate = findColumnValue(row, 'orderDate');
      const rawPaymentDate = findColumnValue(row, 'paymentDate');
      
      const orderDate = parseIfoodDate(rawOrderDate);
      const paymentDate = parseIfoodDate(rawPaymentDate);

      // Extrair valores
      const itemsValue = parseMoneyValue(findColumnValue(row, 'itemsValue'));
      const deliveryFee = parseMoneyValue(findColumnValue(row, 'deliveryFee'));
      const serviceFee = parseMoneyValue(findColumnValue(row, 'serviceFee'));
      const grossRevenue = itemsValue + deliveryFee + serviceFee;

      // Promoções
      const ifoodPromotions = Math.abs(parseMoneyValue(findColumnValue(row, 'ifoodPromotions')));
      const storePromotions = Math.abs(parseMoneyValue(findColumnValue(row, 'storePromotions')));

      // Comissões
      const ifoodCommissionValue = Math.abs(parseMoneyValue(findColumnValue(row, 'ifoodCommission')));
      const transactionCommission = Math.abs(parseMoneyValue(findColumnValue(row, 'transactionCommission')));
      const weeklyPlanFee = Math.abs(parseMoneyValue(findColumnValue(row, 'weeklyPlanFee')));
      
      let netValue = parseMoneyValue(findColumnValue(row, 'netValue'));
      if (netValue === 0) {
        netValue = grossRevenue - ifoodCommissionValue - transactionCommission - weeklyPlanFee;
      }

      // Forma de pagamento
      const paymentOrigin = findColumnValue(row, 'paymentOrigin') || 'Não informado';

      const record: IfoodAdvancedAnalytics = {
        client_id: clientId,
        date: orderDate,
        order_number: String(orderNumber),
        billing_type: billingType,
        order_date: orderDate,
        payment_date: paymentDate,
        payment_origin: paymentOrigin,
        items_value: itemsValue,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        gross_revenue: grossRevenue,
        ifood_promotions: ifoodPromotions,
        store_promotions: storePromotions,
        ifood_commission_value: ifoodCommissionValue,
        transaction_commission: transactionCommission,
        weekly_plan_fee: weeklyPlanFee,
        net_value: netValue,
        source: 'ifood'
      };

      detailedData.push(record);
      
      if (!isCancellation) {
        totalValidOrders++;
      }

    } catch (error) {
      console.error(`❌ ERRO na linha ${i + 1}:`, error);
      errors.push({
        row: i + 1,
        error: `Erro ao processar linha: ${error.message}`,
        data: row
      });
    }
  }

  console.log(`✅ Processados: ${detailedData.length} registros`);
  console.log(`📦 Pedidos válidos: ${totalValidOrders}`);
  console.log(`🚫 Cancelamentos: ${totalCancellations}`);

  // Gerar análise consolidada
  const consolidatedAnalytics = generateConsolidatedAnalytics(detailedData);
  
  return { detailedData, consolidatedAnalytics, errors };
};

const generateConsolidatedAnalytics = (data: IfoodAdvancedAnalytics[]): ConsolidatedAnalytics => {
  // Filtrar pedidos válidos (não cancelados)
  const validOrders = data.filter(item => !isOrderCancelled(item.billing_type));
  const cancelledOrders = data.filter(item => isOrderCancelled(item.billing_type));

  // Pedidos
  const totalOrders = data.length;
  const completedOrders = validOrders.length;
  const cancelledOrdersCount = cancelledOrders.length;

  // Agrupar por dia
  const dailyOrders: Record<string, number> = {};
  const dailyRevenue: Record<string, number> = {};
  
  validOrders.forEach(order => {
    const date = order.order_date;
    dailyOrders[date] = (dailyOrders[date] || 0) + 1;
    dailyRevenue[date] = (dailyRevenue[date] || 0) + order.gross_revenue;
  });

  // Agrupar por semana (ISO)
  const weeklyOrders: Record<string, number> = {};
  const weeklyRevenue: Record<string, number> = {};
  
  validOrders.forEach(order => {
    const week = getISOWeek(order.order_date);
    weeklyOrders[week] = (weeklyOrders[week] || 0) + 1;
    weeklyRevenue[week] = (weeklyRevenue[week] || 0) + order.gross_revenue;
  });

  // Melhor dia
  const bestOrderDay = Object.entries(dailyOrders).reduce(
    (best, [date, count]) => (count > best.count ? { date, count } : best),
    { date: '', count: 0 }
  );

  // Faturamento
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.gross_revenue, 0);

  // Ticket médio
  const monthlyAverageTicket = completedOrders > 0 ? totalRevenue / completedOrders : 0;
  const dailyAverageTicket: Record<string, number> = {};
  const weeklyAverageTicket: Record<string, number> = {};

  Object.entries(dailyOrders).forEach(([date, orders]) => {
    dailyAverageTicket[date] = orders > 0 ? dailyRevenue[date] / orders : 0;
  });

  Object.entries(weeklyOrders).forEach(([week, orders]) => {
    weeklyAverageTicket[week] = orders > 0 ? weeklyRevenue[week] / orders : 0;
  });

  // Formas de pagamento
  const paymentMethods: Record<string, any> = {};
  
  validOrders.forEach(order => {
    const method = order.payment_origin;
    if (!paymentMethods[method]) {
      paymentMethods[method] = { orders: 0, revenue: 0 };
    }
    paymentMethods[method].orders += 1;
    paymentMethods[method].revenue += order.gross_revenue;
  });

  // Calcular percentuais
  Object.keys(paymentMethods).forEach(method => {
    paymentMethods[method].ordersPercentage = (paymentMethods[method].orders / completedOrders) * 100;
    paymentMethods[method].revenuePercentage = (paymentMethods[method].revenue / totalRevenue) * 100;
  });

  // Incentivos e comissões
  const totalIfoodPromotions = validOrders.reduce((sum, order) => sum + order.ifood_promotions, 0);
  const totalStorePromotions = validOrders.reduce((sum, order) => sum + order.store_promotions, 0);
  const totalIfoodCommission = validOrders.reduce((sum, order) => sum + order.ifood_commission_value, 0);
  const totalTransactionCommission = validOrders.reduce((sum, order) => sum + order.transaction_commission, 0);
  const totalWeeklyPlanFee = validOrders.reduce((sum, order) => sum + order.weekly_plan_fee, 0);
  const totalNetRevenue = validOrders.reduce((sum, order) => sum + order.net_value, 0);

  return {
    totalOrders,
    completedOrders,
    cancelledOrders: cancelledOrdersCount,
    dailyOrders,
    weeklyOrders,
    bestOrderDay,
    totalRevenue,
    dailyRevenue,
    weeklyRevenue,
    monthlyAverageTicket,
    dailyAverageTicket,
    weeklyAverageTicket,
    paymentMethods,
    totalIfoodPromotions,
    totalStorePromotions,
    totalIfoodCommission,
    totalTransactionCommission,
    totalWeeklyPlanFee,
    totalNetRevenue
  };
};

const isOrderCancelled = (billingType: string): boolean => {
  return billingType && (
    String(billingType).toLowerCase().includes('cancelad') ||
    String(billingType).toLowerCase().includes('cancel') ||
    String(billingType).toLowerCase().includes('estorn') ||
    String(billingType).toLowerCase().includes('débito') ||
    String(billingType).toLowerCase().includes('debito')
  );
};

const getISOWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};