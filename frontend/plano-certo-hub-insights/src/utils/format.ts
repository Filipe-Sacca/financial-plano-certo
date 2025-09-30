/**
 * 🎨 Utilitários de Formatação
 *
 * Funções auxiliares para formatação de dados no frontend
 */

/**
 * Formata valor monetário em Real Brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data em formato brasileiro
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formata data e hora em formato brasileiro
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Formata apenas hora
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata número decimal
 */
export function formatDecimal(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Converte data para formato ISO (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formata status em português
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'PROCESSING': 'Processando',
    'COMPLETED': 'Concluído',
    'FAILED': 'Falhou',
    'CANCELLED': 'Cancelado',
    'ACTIVE': 'Ativo',
    'INACTIVE': 'Inativo',
    'PAID': 'Pago',
    'UNPAID': 'Não Pago',
    'CONFIRMED': 'Confirmado',
    'DISPATCHED': 'Despachado',
    'DELIVERED': 'Entregue',
  };

  return statusMap[status] || status;
}

/**
 * Trunca texto longo
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Formata CPF/CNPJ
 */
export function formatDocument(doc: string): string {
  const numbers = doc.replace(/\D/g, '');

  if (numbers.length === 11) {
    // CPF
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return doc;
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

/**
 * Parse valor monetário de string para número
 */
export function parseCurrency(value: string): number {
  // Remove R$, espaços e troca vírgula por ponto
  const cleanValue = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  return parseFloat(cleanValue) || 0;
}