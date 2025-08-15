import * as XLSX from 'xlsx';

export const downloadFinancialTemplate = () => {
  const templateData = [
    {
      Data: '2024-01-01',
      Faturamento: 1500.00,
      Pedidos: 45,
      'Ticket Médio': 33.33,
      Taxa: 150.00,
      Comissao: 225.00
    },
    {
      Data: '2024-01-02',
      Faturamento: 1800.50,
      Pedidos: 52,
      'Ticket Médio': 34.63,
      Taxa: 180.00,
      Comissao: 270.00
    },
    {
      Data: '2024-01-03',
      Faturamento: 2200.75,
      Pedidos: 68,
      'Ticket Médio': 32.36,
      Taxa: 220.00,
      Comissao: 330.00
    },
    {
      Data: '2024-01-04',
      Faturamento: 1950.25,
      Pedidos: 61,
      'Ticket Médio': 31.97,
      Taxa: 195.00,
      Comissao: 292.50
    },
    {
      Data: '2024-01-05',
      Faturamento: 2450.00,
      Pedidos: 75,
      'Ticket Médio': 32.67,
      Taxa: 245.00,
      Comissao: 367.50
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados Financeiros');
  XLSX.writeFile(wb, 'template_dados_financeiros.xlsx');
};

export const downloadIfoodTemplate = () => {
  const templateData = [
    {
      'ID DO PEDIDO': 'a6b5bab6-f8bc-45b7-afa9-cff26634cfcc',
      'N° PEDIDO': '6411',
      'DATA': '30/06/25 19:35:11',
      'RESTAURANTE': 'Serra Grande Burger e Petiscos',
      'ID DO RESTAURANTE': '320023',
      'TAXA DE ENTREGA': 14.99,
      'VALOR DOS ITENS': 56.00,
      'INCENTIVO PROMOCIONAL DO IFOOD': 4.81,
      'INCENTIVO PROMOCIONAL DA LOJA': 4.99,
      'TAXA DE SERVIÇO': 0.99,
      'TOTAL DO PARCEIRO': 70.81,
      'TOTAL DO PEDIDO': 62.18,
      'FORMAS DE PAGAMENTO': 'Débito (Visa Débito) pelo app',
      'DATA DO CANCELAMENTO': '',
      'ORIGEM DO CANCELAMENTO': '',
      'MOTIVO DO CANCELAMENTO': '',
      'CANCELAMENTO É CONTESTÁVEL': '',
      'MOTIVO DA IMPOSSIBILIDADE DE CONTESTAR': '',
      'DATA LIMITE DE CONTESTAÇÃO': '',
      'CONFIRMADO': 'SIM',
      'DATA DE AGENDAMENTO': '',
      'TIPO DE PEDIDO': 'ENTREGA',
      'AGENDADO': 'NÃO',
      'CANAL DE VENDA': 'iFood',
      'TEM CANCELAMENTO PARCIAL': 'NÃO'
    },
    {
      'ID DO PEDIDO': 'a93e7bfd-097f-441d-adab-b9fae2f152e4',
      'N° PEDIDO': '9637',
      'DATA': '30/06/25 19:08:47',
      'RESTAURANTE': 'Serra Grande Burger e Petiscos',
      'ID DO RESTAURANTE': '320023',
      'TAXA DE ENTREGA': 7.99,
      'VALOR DOS ITENS': 85.00,
      'INCENTIVO PROMOCIONAL DO IFOOD': 10.00,
      'INCENTIVO PROMOCIONAL DA LOJA': 7.99,
      'TAXA DE SERVIÇO': 1.99,
      'TOTAL DO PARCEIRO': 95.00,
      'TOTAL DO PEDIDO': 76.99,
      'FORMAS DE PAGAMENTO': 'Apple Pay (Visa)',
      'DATA DO CANCELAMENTO': '',
      'ORIGEM DO CANCELAMENTO': '',
      'MOTIVO DO CANCELAMENTO': '',
      'CANCELAMENTO É CONTESTÁVEL': '',
      'MOTIVO DA IMPOSSIBILIDADE DE CONTESTAR': '',
      'DATA LIMITE DE CONTESTAÇÃO': '',
      'CONFIRMADO': 'SIM',
      'DATA DE AGENDAMENTO': '',
      'TIPO DE PEDIDO': 'ENTREGA',
      'AGENDADO': 'NÃO',
      'CANAL DE VENDA': 'iFood',
      'TEM CANCELAMENTO PARCIAL': 'NÃO'
    },
    {
      'ID DO PEDIDO': '6731e9d8-7e04-4531-8ff3-4326989af266',
      'N° PEDIDO': '2913',
      'DATA': '30/06/25 19:05:34',
      'RESTAURANTE': 'Serra Grande Burger e Petiscos',
      'ID DO RESTAURANTE': '320023',
      'TAXA DE ENTREGA': 19.99,
      'VALOR DOS ITENS': 84.00,
      'INCENTIVO PROMOCIONAL DO IFOOD': 0.00,
      'INCENTIVO PROMOCIONAL DA LOJA': 0.00,
      'TAXA DE SERVIÇO': 1.99,
      'TOTAL DO PARCEIRO': 103.99,
      'TOTAL DO PEDIDO': 105.98,
      'FORMAS DE PAGAMENTO': 'PIX',
      'DATA DO CANCELAMENTO': '',
      'ORIGEM DO CANCELAMENTO': '',
      'MOTIVO DO CANCELAMENTO': '',
      'CANCELAMENTO É CONTESTÁVEL': '',
      'MOTIVO DA IMPOSSIBILIDADE DE CONTESTAR': '',
      'DATA LIMITE DE CONTESTAÇÃO': '',
      'CONFIRMADO': 'SIM',
      'DATA DE AGENDAMENTO': '',
      'TIPO DE PEDIDO': 'ENTREGA',
      'AGENDADO': 'NÃO',
      'CANAL DE VENDA': 'iFood',
      'TEM CANCELAMENTO PARCIAL': 'NÃO'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados iFood');
  XLSX.writeFile(wb, 'template_dados_ifood.xlsx');
};

export const downloadMenuTemplate = () => {
  const templateData = [
    {
      Produto: 'Pizza Margherita',
      Categoria: 'Pizzas',
      Visualizacoes: 120,
      Cliques: 15,
      Conversoes: 8
    },
    {
      Produto: 'Hambúrguer Artesanal',
      Categoria: 'Lanches',
      Visualizacoes: 95,
      Cliques: 22,
      Conversoes: 12
    },
    {
      Produto: 'Lasanha Bolonhesa',
      Categoria: 'Massas',
      Visualizacoes: 80,
      Cliques: 18,
      Conversoes: 10
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados do Cardápio');
  XLSX.writeFile(wb, 'template_dados_cardapio.xlsx');
};

export const downloadProductsTemplate = () => {
  const templateData = [
    {
      'Posição no ranking': 1,
      'Categoria': '>> Os Mais Vendidos <<',
      'Nome do item': 'Espeto Medalhão de Carne c/ bacon, arroz, feijão tropeiro, vinagrete e mandioca',
      'Visitas': 935,
      'Vendas': 416,
      'Total vendas': 'R$ 14.550,40'
    },
    {
      'Posição no ranking': 2,
      'Categoria': '>> Os Mais Vendidos <<',
      'Nome do item': 'Espeto Medalhão de Frango c/ bacon, arroz, feijão tropeiro, vinagrete e mandioca',
      'Visitas': 527,
      'Vendas': 255,
      'Total vendas': 'R$ 8.412,50'
    },
    {
      'Posição no ranking': 3,
      'Categoria': 'Prato Feito - Pf',
      'Nome do item': 'Bife Gralhado com arroz, feijão carioca e salada',
      'Visitas': 595,
      'Vendas': 192,
      'Total vendas': 'R$ 6.150,30'
    },
    {
      'Posição no ranking': 4,
      'Categoria': 'Espeto de Carne na Brasa',
      'Nome do item': 'Espeto Carne Coxão mole na brasa, arroz, feijão tropeiro, mandioca e vinagrete',
      'Visitas': 417,
      'Vendas': 143,
      'Total vendas': 'R$ 4.649,70'
    },
    {
      'Posição no ranking': 5,
      'Categoria': 'Prato Feito - Pf',
      'Nome do item': 'Filé de Frango Grelhado com arroz, feijão carioca e salada',
      'Visitas': 231,
      'Vendas': 125,
      'Total vendas': 'R$ 3.634,70'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
  XLSX.writeFile(wb, 'template_produtos.xlsx');
};

export const downloadSalesFunnelTemplate = () => {
  const templateData = [
    {
      Etapa: 'Visitas',
      Quantidade: 7146,
      'Percentual comparativo ao período anterior': '-6,89%',
      'Percentual atual': '+100%',
      'Percentual anterior': '+100%'
    },
    {
      Etapa: 'Visualizações',
      Quantidade: 5096,
      'Percentual comparativo ao período anterior': '-0,88%',
      'Percentual atual': '+71,31%',
      'Percentual anterior': '+66,98%'
    },
    {
      Etapa: 'Revisão',
      Quantidade: 2369,
      'Percentual comparativo ao período anterior': '-7,32%',
      'Percentual atual': '+33,15%',
      'Percentual anterior': '+33,3%'
    },
    {
      Etapa: 'Sacola',
      Quantidade: 2381,
      'Percentual comparativo ao período anterior': '-7,1%',
      'Percentual atual': '+33,32%',
      'Percentual anterior': '+33,39%'
    },
    {
      Etapa: 'Concluídos',
      Quantidade: 1574,
      'Percentual comparativo ao período anterior': '-6,92%',
      'Percentual atual': '+22,03%',
      'Percentual anterior': '+22,03%'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Funil de Vendas');
  XLSX.writeFile(wb, 'template_funil_vendas.xlsx');
};
