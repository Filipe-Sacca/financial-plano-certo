import { format, parse, isValid } from 'date-fns';

export const parseExcelDate = (dateValue: any): string => {
  console.log(`🔄 Parseando data: "${dateValue}", tipo: ${typeof dateValue}`);
  
  if (!dateValue) {
    const fallback = format(new Date(), 'yyyy-MM-dd');
    console.log(`❌ Data vazia, usando fallback: ${fallback}`);
    return fallback;
  }

  // Se já é uma data válida
  if (dateValue instanceof Date && isValid(dateValue)) {
    const result = format(dateValue, 'yyyy-MM-dd');
    console.log(`✅ Data válida convertida: ${result}`);
    return result;
  }

  // Se é um número (serial do Excel)
  if (typeof dateValue === 'number') {
    console.log(`📊 Convertendo número Excel: ${dateValue}`);
    // Excel conta dias desde 1900-01-01 (com ajuste para bug do Excel)
    const excelEpoch = new Date(1900, 0, 1);
    const days = dateValue - 2; // Ajuste para o bug do Excel (ano 1900 não bissexto)
    const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    if (isValid(date)) {
      const result = format(date, 'yyyy-MM-dd');
      console.log(`✅ Data Excel convertida: ${dateValue} -> ${result}`);
      return result;
    }
  }

  // Se é string, tentar diferentes formatos
  if (typeof dateValue === 'string') {
    const dateStr = dateValue.trim();
    console.log(`📝 Parseando string de data: "${dateStr}"`);
    
    // Primeiro, tentar detectar o formato baseado no padrão
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const [first, second, third] = parts;
      console.log(`🔍 Partes da data: [${first}, ${second}, ${third}]`);
      
      // Determinar se é formato brasileiro (DD/MM/YYYY) ou americano (MM/DD/YYYY)
      let day, month, year;
      
      // Se o terceiro campo tem 4 dígitos, é o ano
      if (third.length === 4) {
        year = third;
        // Se o primeiro número > 12, é dia (formato brasileiro)
        if (parseInt(first) > 12) {
          day = first;
          month = second;
          console.log(`🇧🇷 Formato brasileiro detectado: ${day}/${month}/${year}`);
        } 
        // Se o segundo número > 12, é formato americano (MM/DD/YYYY)
        else if (parseInt(second) > 12) {
          month = first;
          day = second;
          console.log(`🇺🇸 Formato americano detectado: ${month}/${day}/${year}`);
        }
        // Ambiguidade - tentar formato brasileiro primeiro (padrão do iFood)
        else {
          day = first;
          month = second;
          console.log(`❓ Ambíguo, assumindo formato brasileiro: ${day}/${month}/${year}`);
        }
      }
      // Se o primeiro campo tem 4 dígitos, é formato ISO (YYYY-MM-DD)
      else if (first.length === 4) {
        year = first;
        month = second;
        day = third;
        console.log(`🌐 Formato ISO detectado: ${year}-${month}-${day}`);
      }
      // Formato de 2 dígitos para ano
      else {
        // Assumir formato brasileiro por padrão
        day = first;
        month = second;
        year = `20${third}`; // Assumir século 21
        console.log(`📅 Formato brasileiro com ano de 2 dígitos: ${day}/${month}/${year}`);
      }

      // Validar e construir a data
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
        // Criar data usando o construtor (month é 0-indexed)
        const constructedDate = new Date(yearNum, monthNum - 1, dayNum);
        
        if (isValid(constructedDate)) {
          const result = format(constructedDate, 'yyyy-MM-dd');
          console.log(`✅ Data construída com sucesso: ${result}`);
          return result;
        }
      }
    }

    // Formatos de fallback para tentar parsear
    const formatsToBeTried = [
      'dd/MM/yyyy',
      'MM/dd/yyyy', 
      'yyyy-MM-dd',
      'dd-MM-yyyy',
      'MM-dd-yyyy',
      'dd.MM.yyyy',
      'MM.dd.yyyy',
      'dd/MM/yy',
      'MM/dd/yy',
      'dd-MM-yy',
      'MM-dd-yy'
    ];

    for (const formatStr of formatsToBeTried) {
      try {
        const parsedDate = parse(dateStr, formatStr, new Date());
        if (isValid(parsedDate)) {
          const result = format(parsedDate, 'yyyy-MM-dd');
          console.log(`✅ Data parseada com formato ${formatStr}: ${result}`);
          return result;
        }
      } catch (error) {
        continue;
      }
    }

    // Tentar parseamento nativo do JavaScript como último recurso
    try {
      const nativeDate = new Date(dateStr);
      if (isValid(nativeDate) && !isNaN(nativeDate.getTime())) {
        const result = format(nativeDate, 'yyyy-MM-dd');
        console.log(`✅ Data parseada nativamente: ${result}`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Falha no parseamento nativo: ${error}`);
    }
  }

  // Fallback: retornar data atual
  const fallback = format(new Date(), 'yyyy-MM-dd');
  console.warn(`⚠️ Não foi possível parsear a data: "${dateValue}", usando fallback: ${fallback}`);
  return fallback;
};

export const detectDateFormat = (sampleDates: any[]): string => {
  const validDates = sampleDates.filter(date => date && date !== '');
  
  if (validDates.length === 0) return 'dd/MM/yyyy';

  // Analisar padrões comuns
  const sample = String(validDates[0]).trim();
  
  if (sample.includes('/')) {
    const parts = sample.split('/');
    if (parts.length === 3) {
      const [first, second, third] = parts;
      
      // Se primeiro número > 12, provavelmente é dia
      if (parseInt(first) > 12) return 'dd/MM/yyyy';
      
      // Se segundo número > 12, provavelmente é formato americano
      if (parseInt(second) > 12) return 'MM/dd/yyyy';
      
      // Se terceiro número tem 4 dígitos
      if (third.length === 4) {
        return parseInt(first) > 12 ? 'dd/MM/yyyy' : 'MM/dd/yyyy';
      } else {
        return parseInt(first) > 12 ? 'dd/MM/yy' : 'MM/dd/yy';
      }
    }
  }

  if (sample.includes('-')) {
    const parts = sample.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return 'yyyy-MM-dd';
    }
    return 'dd-MM-yyyy';
  }

  return 'dd/MM/yyyy'; // Padrão brasileiro
};

export const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

export const mapColumnNames = (headers: string[]): Record<string, string> => {
  const columnMap: Record<string, string> = {};
  
  // Mapeamento de colunas comuns
  const mappings = {
    // Data
    data: ['data', 'date', 'fecha', 'datum'],
    
    // Receita/Faturamento
    revenue: ['receita', 'faturamento', 'revenue', 'sales', 'vendas', 'valor_total', 'total'],
    
    // Pedidos
    orders: ['pedidos', 'orders', 'quantidade_pedidos', 'qtd_pedidos', 'num_pedidos'],
    
    // Ticket Médio
    ticket: ['ticket_medio', 'ticket', 'average_ticket', 'valor_medio', 'ticket_médio'],
    
    // Taxa/Comissão
    commission: ['comissao', 'commission', 'taxa', 'fee', 'comissão'],
    
    // Taxa de Entrega
    delivery_fee: ['taxa_entrega', 'delivery_fee', 'entrega', 'delivery', 'frete']
  };

  headers.forEach(header => {
    const normalized = normalizeColumnName(header);
    
    // Encontrar mapeamento
    for (const [key, variants] of Object.entries(mappings)) {
      if (variants.some(variant => normalized.includes(variant))) {
        columnMap[key] = header;
        break;
      }
    }
  });

  return columnMap;
};
