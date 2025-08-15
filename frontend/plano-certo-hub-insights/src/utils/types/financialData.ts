
export interface ProcessedFinancialData {
  client_id: string;
  date: string;
  revenue: number;
  orders_count: number;
  average_ticket: number;
  delivery_fee: number;
  commission: number;
  net_revenue: number;
  source: string;
}

export interface DetailedIfoodData {
  client_id: string;
  date: string;
  store_id: string;
  store_name: string;
  billing_type: string;
  sales_channel: string;
  order_number: string;
  complete_order_id: string;
  order_date: string;
  completion_date: string;
  payment_date: string;
  payment_origin: string;
  payment_details: string;
  items_value: number;
  delivery_fee: number;
  service_fee: number;
  gross_revenue: number;
  ifood_promotions: number;
  store_promotions: number;
  ifood_commission_percent: number;
  ifood_commission_value: number;
  transaction_commission: number;
  weekly_plan_fee: number;
  calculation_base: number;
  gross_value: number;
  net_value: number;
  delivery_time_minutes: number;
  source: string;
}
