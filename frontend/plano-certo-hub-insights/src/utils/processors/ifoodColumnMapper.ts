// Mapeamento específico para relatórios do iFood
export const ifoodColumnMap = {
  // Datas
  orderDate: [
    'DATA_DO_PEDIDO_OCORRENCIA',
    'DATA DO PEDIDO OCORRENCIA', 
    'Data do pedido/ocorrência',
    'Data do pedido/ocorrencia',
    'DATA_PEDIDO',
    'data_do_pedido_ocorrencia'
  ],
  
  paymentDate: [
    'DATA_DE_REPASSE',
    'DATA DE REPASSE',
    'Data de repasse',
    'DATA_REPASSE',
    'data_de_repasse'
  ],
  
  // Identificação
  billingType: [
    'TIPO_DE_FATURAMENTO',
    'TIPO DE FATURAMENTO',
    'Tipo de faturamento',
    'TIPO_FATURAMENTO',
    'tipo_de_faturamento'
  ],
  
  orderNumber: [
    'N°_PEDIDO',
    'N° PEDIDO',
    'Nº PEDIDO',
    'NUMERO_PEDIDO',
    'Número do pedido',
    'N_PEDIDO',
    'NUM_PEDIDO'
  ],
  
  // Valores financeiros
  itemsValue: [
    'VALOR_DOS_ITENS',
    'VALOR DOS ITENS',
    'Valor dos itens',
    'VALOR_ITENS',
    'valor_dos_itens'
  ],
  
  deliveryFee: [
    'TAXA_DE_ENTREGA',
    'TAXA DE ENTREGA',
    'Taxa de entrega',
    'TAXA_ENTREGA',
    'taxa_de_entrega'
  ],
  
  serviceFee: [
    'TAXA_DE_SERVICO',
    'TAXA DE SERVICO',
    'TAXA_DE_SERVIÇO',
    'Taxa de serviço',
    'TAXA_SERVICO',
    'taxa_de_servico'
  ],
  
  // Comissões
  ifoodCommission: [
    'VALOR_COMISSAO_IFOOD',
    'COMISSAO_IFOOD_R$',
    'COMISSAO IFOOD R$',
    'Comissão iFood R$',
    'COMISSÃO_IFOOD_VALOR',
    'valor_comissao_ifood'
  ],
  
  transactionCommission: [
    'COMISSAO_PELA_TRANSACAO_DO_PAGAMENTO',
    'COMISSAO_TRANSACAO_PAGAMENTO',
    'Comissão pela transação do pagamento',
    'COMISSAO_TRANSACAO',
    'comissao_pela_transacao_do_pagamento'
  ],
  
  weeklyPlanFee: [
    'TAXA_PLANO_REPASSE_EM_1_SEMANA',
    'TAXA_PLANO_REPASSE',
    'Taxa do plano de repasse em 1 semana',
    'VALOR_TAXA_PLANO_DE_REPASSE_EM_1_SEMANA',
    'taxa_plano_repasse_em_1_semana'
  ],
  
  netValue: [
    'VALOR_LIQUIDO',
    'VALOR LIQUIDO',
    'Valor líquido',
    'VALOR_LÍQUIDO',
    'valor_liquido'
  ],

  // Promoções e incentivos
  ifoodPromotions: [
    'PROMOCAO_CUSTEADA_PELO_IFOOD',
    'PROMOCAO CUSTEADA PELO IFOOD',
    'Promoção custeada pelo iFood',
    'PROMOCAO_IFOOD',
    'promocao_custeada_pelo_ifood'
  ],

  storePromotions: [
    'PROMOCAO_CUSTEADA_PELA_LOJA',
    'PROMOCAO CUSTEADA PELA LOJA',
    'Promoção custeada pela loja',
    'PROMOCAO_LOJA',
    'promocao_custeada_pela_loja'
  ],

  // Forma de pagamento
  paymentOrigin: [
    'ORIGEM_DE_FORMA_DE_PAGAMENTO',
    'ORIGEM DE FORMA DE PAGAMENTO',
    'Origem de forma de pagamento',
    'FORMA_PAGAMENTO',
    'origem_de_forma_de_pagamento'
  ],

  // Dados adicionais para análise
  storeId: [
    'ID_LOJA',
    'ID LOJA',
    'ID da loja',
    'STORE_ID',
    'id_loja'
  ],

  storeName: [
    'NOME_LOJA',
    'NOME LOJA',
    'Nome da loja',
    'STORE_NAME',
    'nome_loja'
  ],

  salesChannel: [
    'CANAL_VENDAS',
    'CANAL VENDAS',
    'Canal de vendas',
    'SALES_CHANNEL',
    'canal_vendas'
  ],

  completeOrderId: [
    'ID_PEDIDO_COMPLETO',
    'ID PEDIDO COMPLETO',
    'ID do pedido completo',
    'COMPLETE_ORDER_ID',
    'id_pedido_completo'
  ],

  completionDate: [
    'DATA_CONCLUSAO',
    'DATA CONCLUSAO',
    'Data de conclusão',
    'DATA_CONCLUSÃO',
    'data_conclusao'
  ],

  paymentDetails: [
    'DETALHES_PAGAMENTO',
    'DETALHES PAGAMENTO',
    'Detalhes do pagamento',
    'PAYMENT_DETAILS',
    'detalhes_pagamento'
  ],

  ifoodCommissionPercent: [
    'PERCENTUAL_COMISSAO_IFOOD',
    'PERCENTUAL COMISSAO IFOOD',
    'Percentual comissão iFood',
    'PERCENTUAL_COMISSÃO_IFOOD',
    'percentual_comissao_ifood'
  ],

  calculationBase: [
    'BASE_CALCULO',
    'BASE CALCULO',
    'Base de cálculo',
    'BASE_CÁLCULO',
    'base_calculo'
  ],

  grossValue: [
    'VALOR_BRUTO',
    'VALOR BRUTO',
    'Valor bruto',
    'GROSS_VALUE',
    'valor_bruto'
  ],

  deliveryTimeMinutes: [
    'TEMPO_ENTREGA_MINUTOS',
    'TEMPO ENTREGA MINUTOS',
    'Tempo de entrega em minutos',
    'DELIVERY_TIME',
    'tempo_entrega_minutos'
  ]
};

export const findColumnValue = (row: any, columnKey: keyof typeof ifoodColumnMap): any => {
  const possibleNames = ifoodColumnMap[columnKey];
  
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  
  return null;
};

export const validateColumnMapping = (headers: string[]) => {
  const foundColumns: Record<string, string> = {};
  const missingColumns: string[] = [];
  
  Object.entries(ifoodColumnMap).forEach(([key, possibleNames]) => {
    const found = possibleNames.find(name => headers.includes(name));
    if (found) {
      foundColumns[key] = found;
    } else {
      missingColumns.push(key);
    }
  });
  
  return { foundColumns, missingColumns };
};