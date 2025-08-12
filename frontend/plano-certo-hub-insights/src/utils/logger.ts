/**
 * Sistema de logging profissional com níveis condicionais
 * 
 * Em desenvolvimento: Todos os logs aparecem
 * Em produção: Apenas erros críticos aparecem
 */

interface LogData {
  [key: string]: any;
}

class Logger {
  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug(message: string, data?: LogData): void {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  }

  /**
   * Log de informação - apenas em desenvolvimento
   */
  info(message: string, data?: LogData): void {
    if (import.meta.env.DEV) {
      console.info(message, data);
    }
  }

  /**
   * Log de aviso - sempre aparece
   */
  warn(message: string, data?: LogData): void {
    console.warn(message, data);
  }

  /**
   * Log de erro - sempre aparece
   */
  error(message: string, error?: any): void {
    console.error(message, error);
  }

  /**
   * Log de tabela - apenas em desenvolvimento
   */
  table(data: any): void {
    if (import.meta.env.DEV) {
      console.table(data);
    }
  }

  /**
   * Agrupa logs - apenas em desenvolvimento
   */
  group(label: string): void {
    if (import.meta.env.DEV) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (import.meta.env.DEV) {
      console.groupEnd();
    }
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Para compatibilidade, manter console.error sempre ativo
export const logError = (message: string, error?: any) => {
  console.error(message, error);
};

export default logger;