/**
 * Utilitário para validação de tokens iFood
 * Centraliza a lógica de verificação de expiração para ser reutilizada
 */

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt: Date | null;
  hoursUntilExpiry: number | null;
  error?: string;
}

export interface TokenData {
  expires_at?: number | string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Verifica se um token iFood está válido e não expirado
 * Suporta diferentes formatos de expires_at:
 * - Timestamp em segundos
 * - Timestamp em milissegundos  
 * - Duração em segundos (relativa a updated_at/created_at)
 * - String de data ISO
 */
export function validateIfoodToken(token: TokenData, debugPrefix = ''): TokenValidationResult {
  const result: TokenValidationResult = {
    isValid: false,
    isExpired: false,
    expiresAt: null,
    hoursUntilExpiry: null
  };

  if (!token.expires_at) {
    console.log(`⚠️ [${debugPrefix}] expires_at não definido, assumindo token válido`);
    result.isValid = true;
    return result;
  }

  const now = new Date();
  let expiresAt: Date | null = null;
  
  console.log(`🔍 [${debugPrefix}] Verificando expiração do token:`, {
    rawExpiresAt: token.expires_at,
    type: typeof token.expires_at,
    currentTime: now.toISOString()
  });

  try {
    if (typeof token.expires_at === 'number') {
      // Se é número, tentar diferentes interpretações
      if (token.expires_at > 10000000000) {
        // Timestamp em milissegundos
        expiresAt = new Date(token.expires_at);
        console.log(`📅 [${debugPrefix}] Interpretado como timestamp em milissegundos`);
      } else if (token.expires_at > 1000000000) {
        // Timestamp em segundos
        expiresAt = new Date(token.expires_at * 1000);
        console.log(`📅 [${debugPrefix}] Interpretado como timestamp em segundos`);
      } else if (token.expires_at > 0 && token.expires_at < 86400) {
        // Duração em segundos (menos de 24h), usar updated_at como base
        const baseTime = token.updated_at ? new Date(token.updated_at) : new Date(token.created_at!);
        expiresAt = new Date(baseTime.getTime() + (token.expires_at * 1000));
        console.log(`📅 [${debugPrefix}] Interpretado como duração em segundos desde`, baseTime);
      }
    } else if (typeof token.expires_at === 'string') {
      // Se é string, tentar parse direto
      expiresAt = new Date(token.expires_at);
      console.log(`📅 [${debugPrefix}] Interpretado como string de data`);
    }

    // Verificar se conseguimos uma data válida
    if (!expiresAt || isNaN(expiresAt.getTime())) {
      console.warn(`⚠️ [${debugPrefix}] Não foi possível interpretar expires_at, assumindo token válido`);
      result.isValid = true;
      result.error = 'Não foi possível interpretar expires_at';
      return result;
    }

    result.expiresAt = expiresAt;
    result.hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    console.log(`⏰ [${debugPrefix}] Verificação final:`, {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      hoursUntilExpiry: result.hoursUntilExpiry,
      isExpired: result.hoursUntilExpiry <= 0
    });

    // Determinar se está expirado
    result.isExpired = result.hoursUntilExpiry <= 0;
    result.isValid = !result.isExpired;

    if (result.isExpired) {
      console.warn(`❌ [${debugPrefix}] Token realmente expirado`);
    } else {
      console.log(`✅ [${debugPrefix}] Token válido, expira em ${Math.round(result.hoursUntilExpiry)} horas`);
    }

  } catch (parseError) {
    console.warn(`⚠️ [${debugPrefix}] Erro ao interpretar expires_at:`, parseError);
    result.isValid = true; // Em caso de erro, assumir que está válido para evitar falsos positivos
    result.error = `Erro no parse: ${parseError}`;
  }

  return result;
}

/**
 * Gera uma descrição amigável do status do token
 */
export function getTokenStatusDescription(validation: TokenValidationResult): string {
  if (!validation.isValid && validation.isExpired) {
    return 'Token expirado. Renove para continuar.';
  }
  
  if (validation.hoursUntilExpiry !== null && validation.hoursUntilExpiry < 24) {
    return `Integração ativa (expira em ${Math.round(validation.hoursUntilExpiry)}h)`;
  }
  
  return 'Integração funcionando normalmente';
} 