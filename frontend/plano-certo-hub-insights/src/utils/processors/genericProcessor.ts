
import { parseExcelDate } from '../dateUtils';
import { ProcessedFinancialData } from '../types/financialData';
import { aggregateDataByDate } from './aggregationUtils';

export const processGenericFinancialData = (data: any[], clientId: string, columnMapping: Record<string, string>) => {
  const processed: ProcessedFinancialData[] = [];
  const errors: any[] = [];

  console.log('Processando dados financeiros genéricos:', { columnMapping, sampleRow: data[0] });

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const dateField = row[columnMapping.data] || 
                       row.Data || row.data || row.DATE || 
                       Object.values(row).find(val => {
                         if (!val) return false;
                         const str = String(val);
                         return str.includes('/') || str.includes('-') || !isNaN(Date.parse(str));
                       });

      const date = parseExcelDate(dateField);

      const parseMoneyValue = (value: any) => {
        if (!value && value !== 0) return 0;
        const str = String(value).replace(/[R$\s.]/g, '').replace(',', '.');
        return parseFloat(str) || 0;
      };

      const revenue = parseMoneyValue(
        row[columnMapping.revenue] || 
        row.Receita || row.receita || row.Faturamento || row.faturamento || 
        row.Revenue || row.REVENUE || row.Vendas || row.vendas
      );

      const orders = parseInt(
        row[columnMapping.orders] || 
        row.Pedidos || row.pedidos || row.Orders || row.ORDERS || 
        row['Quantidade de Pedidos'] || row.quantidade_pedidos || 1
      ) || 1;

      const commission = parseMoneyValue(
        row[columnMapping.commission] || 
        row.Comissao || row.comissao || row.Comissão || 
        row.Commission || row.COMMISSION || row.Taxa || row.taxa
      );

      const deliveryFee = parseMoneyValue(
        row[columnMapping.delivery_fee] || 
        row['Taxa de Entrega'] || row.taxa_entrega || 
        row.Delivery || row.delivery || row.Frete || row.frete
      );

      const record: ProcessedFinancialData = {
        client_id: clientId,
        date: date,
        revenue: revenue,
        orders_count: orders,
        average_ticket: orders > 0 ? revenue / orders : 0,
        delivery_fee: deliveryFee,
        commission: commission,
        net_revenue: revenue - deliveryFee - commission,
        source: 'excel'
      };

      processed.push(record);

    } catch (error) {
      errors.push({
        row: i + 1,
        error: `Erro ao processar linha: ${error.message}`,
        data: row
      });
    }
  }

  const aggregatedData = aggregateDataByDate(processed);
  
  console.log('Dados financeiros processados:', { 
    originalRows: processed.length, 
    aggregatedRows: aggregatedData.length, 
    errors: errors.length 
  });
  
  return { processed: aggregatedData, errors };
};
