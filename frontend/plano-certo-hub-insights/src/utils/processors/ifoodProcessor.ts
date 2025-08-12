
import { ProcessedFinancialData, DetailedIfoodData } from '../types/financialData';
import { aggregateDataByDate } from './aggregationUtils';
import { parseMoneyValue } from './valueParser';
import { ifoodColumnMap, findColumnValue, validateColumnMapping } from './ifoodColumnMapper';
import { parseIfoodDate } from './simpleDateParser';

export const processIfoodFinancialData = (data: any[], clientId: string) => {
  const processed: ProcessedFinancialData[] = [];
  const detailed: DetailedIfoodData[] = [];
  const errors: any[] = [];

  console.log('=== PROCESSAMENTO IFOOD MELHORADO ===');
  console.log('📊 Total de linhas:', data.length);
  
  if (data.length === 0) {
    console.error('❌ Nenhum dado recebido!');
    return { processed: [], detailed: [], errors: [{ error: 'Nenhum dado recebido' }] };
  }

  const headers = Object.keys(data[0] || {});
  console.log('📋 Headers encontrados:', headers);
  
  // Validar mapeamento de colunas
  const { foundColumns, missingColumns } = validateColumnMapping(headers);
  console.log('✅ Colunas encontradas:', foundColumns);
  console.log('❌ Colunas faltando:', missingColumns);

  // Log das primeiras 3 linhas para análise de datas
  console.log('🔍 ANÁLISE DAS PRIMEIRAS 3 LINHAS:');
  for (let i = 0; i < Math.min(3, data.length); i++) {
    const row = data[i];
    console.log(`Linha ${i + 1}:`);
    console.log('  - DATA_DO_PEDIDO_OCORRENCIA:', row['DATA_DO_PEDIDO_OCORRENCIA']);
    console.log('  - DATA_DE_REPASSE:', row['DATA_DE_REPASSE']);
    console.log('  - TIPO_DE_FATURAMENTO:', row['TIPO_DE_FATURAMENTO']);
    console.log('  - N°_PEDIDO:', row['N°_PEDIDO']);
  }

  let totalValidRows = 0;
  let totalSkippedCancellations = 0;
  let totalSkippedNoOrder = 0;
  let totalSkippedZeroRevenue = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      // Usar novo mapeamento de colunas
      const billingType = findColumnValue(row, 'billingType') || '';
      
      // Verificar cancelamento de forma mais robusta
      const isCancellation = billingType && (
        String(billingType).toLowerCase().includes('cancelad') ||
        String(billingType).toLowerCase().includes('cancel') ||
        String(billingType).toLowerCase().includes('estorn') ||
        String(billingType).toLowerCase().includes('débito') ||
        String(billingType).toLowerCase().includes('debito')
      );

      if (isCancellation) {
        totalSkippedCancellations++;
        continue;
      }

      const orderNumber = findColumnValue(row, 'orderNumber');
      if (!orderNumber || orderNumber === '' || orderNumber === null) {
        totalSkippedNoOrder++;
        continue;
      }

      // Extrair valores usando o novo mapeamento
      const itemsValue = parseMoneyValue(findColumnValue(row, 'itemsValue'));
      const deliveryFee = parseMoneyValue(findColumnValue(row, 'deliveryFee'));
      const serviceFee = parseMoneyValue(findColumnValue(row, 'serviceFee'));
      const grossRevenue = itemsValue + deliveryFee + serviceFee;

      if (grossRevenue <= 0) {
        totalSkippedZeroRevenue++;
        continue;
      }

      // Processar datas com novo parser - usar especificamente DATA_DO_PEDIDO_OCORRENCIA
      const rawOrderDate = row['DATA_DO_PEDIDO_OCORRENCIA'];
      const rawPaymentDate = findColumnValue(row, 'paymentDate');
      
      console.log(`🗓️ LINHA ${i + 1} - Data bruta do pedido:`, rawOrderDate, typeof rawOrderDate);
      
      const orderDate = parseIfoodDate(rawOrderDate);
      const paymentDate = parseIfoodDate(rawPaymentDate);

      console.log(`🗓️ LINHA ${i + 1} - Data processada do pedido:`, orderDate);

      // Comissões
      const ifoodCommissionValue = Math.abs(parseMoneyValue(findColumnValue(row, 'ifoodCommission')));
      const transactionCommission = Math.abs(parseMoneyValue(findColumnValue(row, 'transactionCommission')));
      const weeklyPlanFee = Math.abs(parseMoneyValue(findColumnValue(row, 'weeklyPlanFee')));
      
      let netValue = parseMoneyValue(findColumnValue(row, 'netValue'));

      // Se não tiver valor líquido, calcular aproximadamente
      if (netValue === 0) {
        netValue = grossRevenue - ifoodCommissionValue - transactionCommission - weeklyPlanFee;
      }

      console.log(`Comissões: iFood R$ ${ifoodCommissionValue.toFixed(2)}, Transação R$ ${transactionCommission.toFixed(2)}, Plano R$ ${weeklyPlanFee.toFixed(2)}`);
      console.log(`VALOR LÍQUIDO: R$ ${netValue.toFixed(2)}`);

      // Calcular net value se necessário
      if (netValue === 0) {
        netValue = grossRevenue - ifoodCommissionValue - transactionCommission - weeklyPlanFee;
      }

      // Dados detalhados
      const detailedRecord: DetailedIfoodData = {
        client_id: clientId,
        date: paymentDate,
        store_id: '',
        store_name: '',
        billing_type: billingType,
        sales_channel: '',
        order_number: String(orderNumber),
        complete_order_id: '',
        order_date: orderDate,
        completion_date: paymentDate,
        payment_date: paymentDate,
        payment_origin: '',
        payment_details: '',
        items_value: itemsValue,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        gross_revenue: grossRevenue,
        ifood_promotions: 0,
        store_promotions: 0,
        ifood_commission_percent: 0,
        ifood_commission_value: ifoodCommissionValue,
        transaction_commission: transactionCommission,
        weekly_plan_fee: weeklyPlanFee,
        calculation_base: 0,
        gross_value: grossRevenue,
        net_value: netValue,
        delivery_time_minutes: 0,
        source: 'ifood'
      };

      detailed.push(detailedRecord);

      // Dados resumidos para agregação - USAR DATA DO PEDIDO, NÃO DO PAGAMENTO
      const record: ProcessedFinancialData = {
        client_id: clientId,
        date: orderDate, // Mudado de paymentDate para orderDate
        revenue: grossRevenue,
        orders_count: 1,
        average_ticket: grossRevenue,
        delivery_fee: deliveryFee,
        commission: ifoodCommissionValue + transactionCommission + weeklyPlanFee,
        net_revenue: netValue,
        source: 'ifood'
      };

      processed.push(record);
      totalValidRows++;

    } catch (error) {
      console.error(`❌ ERRO na linha ${i + 1}:`, error);
      errors.push({
        row: i + 1,
        error: `Erro ao processar linha: ${error.message}`,
        data: row
      });
    }
  }

  console.log('\n=== RESUMO FINAL ===');
  console.log(`📊 Total de linhas: ${data.length}`);
  console.log(`✅ Processadas: ${totalValidRows}`);
  console.log(`🚫 Cancelamentos: ${totalSkippedCancellations}`);
  console.log(`❌ Sem pedido: ${totalSkippedNoOrder}`);
  console.log(`💰 Sem receita: ${totalSkippedZeroRevenue}`);
  console.log(`⚠️ Erros: ${errors.length}`);
  
  // Calcular totais para verificação
  const totalRevenue = processed.reduce((sum, p) => sum + p.revenue, 0);
  const totalOrders = processed.reduce((sum, p) => sum + p.orders_count, 0);
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  console.log('💰 TOTAIS CALCULADOS:');
  console.log(`💵 Receita Total: R$ ${totalRevenue.toFixed(2)}`);
  console.log(`📦 Total Pedidos: ${totalOrders}`);
  console.log(`🎯 Ticket Médio: R$ ${avgTicket.toFixed(2)}`);
  
  // Validação com totais esperados
  const expectedRevenue = 79457.01;
  const expectedOrders = 1579;
  const revenueDiff = Math.abs(totalRevenue - expectedRevenue);
  const ordersDiff = Math.abs(totalOrders - expectedOrders);
  
  console.log('\n🎯 VALIDAÇÃO COM TOTAIS ESPERADOS:');
  console.log(`💵 Esperado: R$ ${expectedRevenue.toFixed(2)} | Calculado: R$ ${totalRevenue.toFixed(2)} | Diferença: R$ ${revenueDiff.toFixed(2)}`);
  console.log(`📦 Esperado: ${expectedOrders} | Calculado: ${totalOrders} | Diferença: ${ordersDiff}`);
  
  if (revenueDiff > 100) {
    console.warn('⚠️ ALERTA: Diferença significativa na receita!');
  }
  if (ordersDiff > 10) {
    console.warn('⚠️ ALERTA: Diferença significativa no número de pedidos!');
  }

  // Log das datas para verificar se estão corretas
  const datesByMonth = processed.reduce((acc, p) => {
    const month = p.date.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 DISTRIBUIÇÃO POR MÊS:');
  Object.entries(datesByMonth).forEach(([month, count]) => {
    console.log(`  - ${month}: ${count} registros`);
  });

  // Agregar dados por data
  const aggregatedData = aggregateDataByDate(processed);
  
  console.log('📊 Dados após agregação por data:', aggregatedData.length, 'registros');
  
  return { processed: aggregatedData, detailed, errors };
};
