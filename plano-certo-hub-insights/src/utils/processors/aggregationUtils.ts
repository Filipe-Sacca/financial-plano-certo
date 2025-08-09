
import { ProcessedFinancialData } from '../types/financialData';

export const aggregateDataByDate = (data: ProcessedFinancialData[]): ProcessedFinancialData[] => {
  const aggregated = new Map<string, ProcessedFinancialData>();

  data.forEach(record => {
    const key = `${record.client_id}-${record.date}`;
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.revenue += record.revenue;
      existing.orders_count += record.orders_count;
      existing.delivery_fee += record.delivery_fee;
      existing.commission += record.commission;
      existing.net_revenue += record.net_revenue;
      existing.average_ticket = existing.orders_count > 0 ? existing.revenue / existing.orders_count : 0;
    } else {
      aggregated.set(key, { ...record });
    }
  });

  return Array.from(aggregated.values());
};
