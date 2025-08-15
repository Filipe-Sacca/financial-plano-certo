
import { DetailedIfoodData } from './dataProcessing';

export interface IfoodAnalytics {
  ticketMedio: number;
  volumeVendas: {
    porDia: Record<string, number>;
    porSemana: Record<string, number>;
    porMes: Record<string, number>;
    porHora: Record<string, number>;
  };
  tempoMedioEntrega: number;
  formasPagamento: Record<string, { count: number; percentage: number }>;
  impactoPromocoes: {
    promocoesIfood: number;
    promocoesLoja: number;
    totalDesconto: number;
    percentualDesconto: number;
  };
  sazonalidade: {
    diasSemana: Record<string, number>;
    periodosMes: Record<string, number>;
  };
  faturamento: {
    bruto: number;
    liquido: number;
    comissoes: number;
    taxas: number;
  };
}

export const calculateIfoodAnalytics = (data: DetailedIfoodData[]): IfoodAnalytics => {
  if (!data || data.length === 0) {
    return {
      ticketMedio: 0,
      volumeVendas: { porDia: {}, porSemana: {}, porMes: {}, porHora: {} },
      tempoMedioEntrega: 0,
      formasPagamento: {},
      impactoPromocoes: { promocoesIfood: 0, promocoesLoja: 0, totalDesconto: 0, percentualDesconto: 0 },
      sazonalidade: { diasSemana: {}, periodosMes: {} },
      faturamento: { bruto: 0, liquido: 0, comissoes: 0, taxas: 0 }
    };
  }

  // Filtrar apenas pedidos válidos (não cancelamentos)
  const validOrders = data.filter(order => 
    !order.billing_type.toLowerCase().includes('cancelad') &&
    !order.billing_type.toLowerCase().includes('débito')
  );

  // Ticket médio
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.gross_revenue, 0);
  const ticketMedio = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Volume de vendas
  const volumeVendas = {
    porDia: {} as Record<string, number>,
    porSemana: {} as Record<string, number>,
    porMes: {} as Record<string, number>,
    porHora: {} as Record<string, number>
  };

  validOrders.forEach(order => {
    const date = new Date(order.order_date);
    const day = date.toISOString().split('T')[0];
    const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay()) / 7)}`;
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const hour = String(date.getHours()).padStart(2, '0');

    volumeVendas.porDia[day] = (volumeVendas.porDia[day] || 0) + 1;
    volumeVendas.porSemana[week] = (volumeVendas.porSemana[week] || 0) + 1;
    volumeVendas.porMes[month] = (volumeVendas.porMes[month] || 0) + 1;
    volumeVendas.porHora[hour] = (volumeVendas.porHora[hour] || 0) + 1;
  });

  // Tempo médio de entrega
  const deliveryTimes = validOrders
    .filter(order => order.delivery_time_minutes > 0)
    .map(order => order.delivery_time_minutes);
  const tempoMedioEntrega = deliveryTimes.length > 0 
    ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
    : 0;

  // Formas de pagamento
  const paymentCounts: Record<string, number> = {};
  validOrders.forEach(order => {
    const payment = order.payment_details || 'Não informado';
    paymentCounts[payment] = (paymentCounts[payment] || 0) + 1;
  });

  const formasPagamento: Record<string, { count: number; percentage: number }> = {};
  Object.entries(paymentCounts).forEach(([payment, count]) => {
    formasPagamento[payment] = {
      count,
      percentage: (count / validOrders.length) * 100
    };
  });

  // Impacto das promoções
  const totalIfoodPromotions = validOrders.reduce((sum, order) => sum + order.ifood_promotions, 0);
  const totalStorePromotions = validOrders.reduce((sum, order) => sum + order.store_promotions, 0);
  const totalDesconto = totalIfoodPromotions + totalStorePromotions;
  const percentualDesconto = totalRevenue > 0 ? (totalDesconto / totalRevenue) * 100 : 0;

  const impactoPromocoes = {
    promocoesIfood: totalIfoodPromotions,
    promocoesLoja: totalStorePromotions,
    totalDesconto,
    percentualDesconto
  };

  // Sazonalidade
  const diasSemana: Record<string, number> = {};
  const periodosMes: Record<string, number> = {};

  validOrders.forEach(order => {
    const date = new Date(order.order_date);
    const dayOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][date.getDay()];
    const dayOfMonth = date.getDate();
    const periodo = dayOfMonth <= 10 ? 'Início' : dayOfMonth <= 20 ? 'Meio' : 'Final';

    diasSemana[dayOfWeek] = (diasSemana[dayOfWeek] || 0) + 1;
    periodosMes[periodo] = (periodosMes[periodo] || 0) + 1;
  });

  // Faturamento
  const totalBruto = validOrders.reduce((sum, order) => sum + order.gross_revenue, 0);
  const totalLiquido = validOrders.reduce((sum, order) => sum + order.net_value, 0);
  const totalComissoes = validOrders.reduce((sum, order) => sum + order.ifood_commission_value, 0);
  const totalTaxas = validOrders.reduce((sum, order) => sum + order.transaction_commission + order.weekly_plan_fee, 0);

  const faturamento = {
    bruto: totalBruto,
    liquido: totalLiquido,
    comissoes: totalComissoes,
    taxas: totalTaxas
  };

  return {
    ticketMedio,
    volumeVendas,
    tempoMedioEntrega,
    formasPagamento,
    impactoPromocoes,
    sazonalidade: { diasSemana, periodosMes },
    faturamento
  };
};
