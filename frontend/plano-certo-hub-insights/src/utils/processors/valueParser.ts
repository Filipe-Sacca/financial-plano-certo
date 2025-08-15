
export const parseMoneyValue = (value: any): number => {
  if (!value && value !== 0) return 0;
  
  let str = String(value);
  console.log(`🔄 Convertendo valor monetário: "${str}"`);
  
  // Remove caracteres não numéricos exceto vírgula, ponto e sinal negativo
  str = str.replace(/[^\d,.-]/g, '');
  
  // Se tem vírgula e ponto, assume formato brasileiro (1.234,56)
  if (str.includes(',') && str.includes('.')) {
    // Conta quantos pontos e vírgulas há
    const dotCount = (str.match(/\./g) || []).length;
    const commaCount = (str.match(/,/g) || []).length;
    
    if (dotCount > 1 || commaCount > 1) {
      // Formato brasileiro: 1.234.567,89
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Determina qual é o separador decimal baseado na posição
      const lastDotIndex = str.lastIndexOf('.');
      const lastCommaIndex = str.lastIndexOf(',');
      
      if (lastCommaIndex > lastDotIndex) {
        // Vírgula é o separador decimal: 1.234,56
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // Ponto é o separador decimal: 1,234.56
        str = str.replace(/,/g, '');
      }
    }
  }
  // Se tem apenas vírgula, assume que é decimal brasileiro (123,45)
  else if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  }
  
  const result = parseFloat(str) || 0;
  console.log(`✅ Resultado da conversão: ${result}`);
  return result;
};

export const getColumnValue = (row: any, ...possibleNames: string[]) => {
  console.log(`🔍 Procurando valor em colunas: [${possibleNames.join(', ')}]`);
  
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      console.log(`✅ Valor encontrado em "${name}": "${row[name]}"`);
      return row[name];
    }
  }
  
  console.log(`❌ Nenhum valor encontrado para as colunas especificadas`);
  return null;
};
