import { format, parse, isValid } from 'date-fns';

export const parseIfoodDate = (dateValue: any): string => {
  console.log('🔍 parseIfoodDate - Input:', dateValue, 'Type:', typeof dateValue);
  
  if (!dateValue) {
    console.log('⚠️ parseIfoodDate - No date value, using today');
    return format(new Date(), 'yyyy-MM-dd');
  }

  // Se já é uma data válida
  if (dateValue instanceof Date && isValid(dateValue)) {
    console.log('✅ parseIfoodDate - Valid Date object');
    return format(dateValue, 'yyyy-MM-dd');
  }

  // Se é um número (serial do Excel) - detectar se está no range de Excel date
  if (typeof dateValue === 'number') {
    console.log('🔢 parseIfoodDate - Number detected:', dateValue);
    
    // Verificar se é um serial válido do Excel (entre 1 e ~50000 para datas razoáveis)
    if (dateValue > 1 && dateValue < 100000) {
      // Excel serial date: 1 = 1900-01-01, mas tem um bug para 1900 (não é bissexto)
      const excelStartDate = new Date(1900, 0, 1);
      const adjustedDays = dateValue - 1; // Excel conta a partir de 1, JS a partir de 0
      
      // Ajustar para o bug do Excel (considera 1900 como bissexto)
      const correctionDays = dateValue > 59 ? -1 : 0;
      
      const date = new Date(excelStartDate.getTime() + (adjustedDays + correctionDays) * 24 * 60 * 60 * 1000);
      
      if (isValid(date)) {
        const result = format(date, 'yyyy-MM-dd');
        console.log('✅ parseIfoodDate - Excel serial converted:', result);
        return result;
      }
    }
  }

  // Se é string, focar no formato brasileiro
  if (typeof dateValue === 'string') {
    const dateStr = dateValue.trim();
    console.log('📝 parseIfoodDate - String processing:', dateStr);
    
    // Primeiro tentar formato brasileiro direto: DD/MM/YYYY
    try {
      const brazilianDate = parse(dateStr, 'dd/MM/yyyy', new Date());
      if (isValid(brazilianDate)) {
        const result = format(brazilianDate, 'yyyy-MM-dd');
        console.log('✅ parseIfoodDate - Brazilian format dd/MM/yyyy:', result);
        return result;
      }
    } catch {}

    // Tentar outros formatos brasileiros comuns
    const brazilianFormats = ['dd/MM/yy', 'dd-MM-yyyy', 'dd-MM-yy', 'yyyy-MM-dd'];
    
    for (const formatStr of brazilianFormats) {
      try {
        const parsedDate = parse(dateStr, formatStr, new Date());
        if (isValid(parsedDate)) {
          const result = format(parsedDate, 'yyyy-MM-dd');
          console.log(`✅ parseIfoodDate - Format ${formatStr}:`, result);
          return result;
        }
      } catch {}
    }

    // Tentar ISO string
    try {
      const isoDate = new Date(dateStr);
      if (isValid(isoDate)) {
        const result = format(isoDate, 'yyyy-MM-dd');
        console.log('✅ parseIfoodDate - ISO string:', result);
        return result;
      }
    } catch {}
  }

  // Fallback
  console.log('⚠️ parseIfoodDate - Fallback to today');
  return format(new Date(), 'yyyy-MM-dd');
};