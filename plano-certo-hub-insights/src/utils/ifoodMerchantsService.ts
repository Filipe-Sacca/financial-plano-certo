import { supabase } from '@/integrations/supabase/client';

// Tipos para a resposta da API do iFood
export interface IfoodMerchant {
  id: string;
  name: string;
  corporateName?: string;
  description?: string;
  status: boolean;
  cuisineTypes?: string[];
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  operatingHours?: any;
  deliveryMethods?: string[];
  paymentMethods?: string[];
  averageDeliveryTime?: number;
  minimumOrderValue?: number;
  deliveryFee?: number;
}

export interface IfoodMerchantsResponse {
  data: IfoodMerchant[];
  pagination?: {
    page: number;
    size: number;
    total: number;
  };
}

// Classe de serviço para gerenciar merchants do iFood
export class IfoodMerchantsService {
  private static readonly IFOOD_API_BASE_URL = 'https://merchant-api.ifood.com.br';

  // Buscar token válido da tabela ifood_tokens
  static async getValidToken(userId?: string): Promise<{ token: string | null; error?: string }> {
    try {
      console.log('🔍 Buscando token para userId:', userId);
      
      let query = supabase
        .from('ifood_tokens')
        .select('access_token, expires_at, created_at, updated_at');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      console.log('📊 Resultado da query:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar token:', error);
        return { token: null, error: 'Erro ao buscar token no banco de dados: ' + error.message };
      }

      if (!data?.access_token) {
        console.error('❌ Token não encontrado na resposta:', data);
        return { token: null, error: 'Token não encontrado. Configure a integração com o iFood primeiro.' };
      }

      console.log('✅ Token encontrado, verificando expiração...');
      console.log('📅 Dados do token:', {
        hasToken: !!data.access_token,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      });

      // Verificar se o token não expirou (simplificado e mais tolerante)
      if (data.expires_at) {
        const now = new Date();
        let expiresAt: Date | null = null;
        
        console.log('🔍 Analisando expires_at:', {
          rawValue: data.expires_at,
          type: typeof data.expires_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          currentTime: now.toISOString()
        });

        try {
          if (typeof data.expires_at === 'number') {
            // Se é número, tentar diferentes interpretações
            if (data.expires_at > 10000000000) {
              // Timestamp em milissegundos
              expiresAt = new Date(data.expires_at);
              console.log('📅 Interpretado como timestamp em milissegundos');
            } else if (data.expires_at > 1000000000) {
              // Timestamp em segundos
              expiresAt = new Date(data.expires_at * 1000);
              console.log('📅 Interpretado como timestamp em segundos');
            } else if (data.expires_at > 0 && data.expires_at < 86400) {
              // Duração em segundos (menos de 24h), usar created_at/updated_at como base
              const baseTime = data.updated_at ? new Date(data.updated_at) : new Date(data.created_at);
              expiresAt = new Date(baseTime.getTime() + (data.expires_at * 1000));
              console.log('📅 Interpretado como duração em segundos desde', baseTime.toISOString());
            }
          } else if (typeof data.expires_at === 'string') {
            // Se é string, tentar parse direto
            expiresAt = new Date(data.expires_at);
            console.log('📅 Interpretado como string de data');
          }

          // Verificar se conseguimos uma data válida
          if (!expiresAt || isNaN(expiresAt.getTime())) {
            console.warn('⚠️ Não foi possível interpretar expires_at, assumindo token válido');
            console.log('✅ Token considerado válido (fallback)');
            return { token: data.access_token };
          }

          console.log('⏰ Verificação final:', {
            now: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            expired: now >= expiresAt,
            timeDiff: expiresAt.getTime() - now.getTime(),
            timeDiffHours: (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
          });

          // Só considerar expirado se realmente passou do tempo
          if (now >= expiresAt) {
            console.error('❌ Token realmente expirado:', {
              expirou: expiresAt.toISOString(),
              agora: now.toISOString(),
              diferenca: now.getTime() - expiresAt.getTime() + 'ms'
            });
            return { 
              token: null, 
              error: 'Token expirado. Faça login novamente no iFood para renovar o token.' 
            };
          }
          
          console.log('✅ Token válido, expira em:', Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60)), 'minutos');
          
        } catch (parseError) {
          console.warn('⚠️ Erro ao interpretar expires_at:', parseError);
          console.log('✅ Token considerado válido (erro no parse)');
          return { token: data.access_token };
        }
      } else {
        console.log('⚠️ expires_at não definido, assumindo token válido');
      }

      console.log('✅ Token válido encontrado');
      return { token: data.access_token };
    } catch (error) {
      console.error('❌ Erro ao buscar token:', error);
      return { token: null, error: 'Erro interno ao verificar token: ' + (error as Error).message };
    }
  }

     // Buscar merchants da API do iFood
   static async fetchMerchants(userId?: string): Promise<{
     merchants: IfoodMerchant[];
     isExistingClient: boolean;
   }> {
    try {
      const tokenResult = await this.getValidToken(userId);
      if (!tokenResult.token) {
        throw new Error(tokenResult.error || 'Token de acesso não encontrado ou inválido');
      }

      console.log('�� Fazendo requisição via N8N webhook...');
      console.log('📡 Endpoint N8N:', 'https://webhook.n8n.hml.planocertodelivery.com/webhook/merchant');
      console.log('🔑 Enviando token para N8N...');
      
      // Enviar para o webhook N8N
      const response = await fetch('https://webhook.n8n.hml.planocertodelivery.com/webhook/merchant', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: tokenResult.token,
          user_id: userId
        })
      });

      console.log('📊 Status da resposta N8N:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na requisição N8N:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        if (response.status === 401) {
          throw new Error('Token expirado ou inválido. Faça login novamente no iFood.');
        }
        
        throw new Error(`Erro na requisição N8N: ${response.status} - ${response.statusText}. Detalhes: ${errorText}`);
      }

             const result = await response.json();
       
       console.log('📋 Resposta completa do N8N:', result);
       console.log('📋 Tipo da resposta:', typeof result);
       console.log('📋 É array?', Array.isArray(result));
       
       // LOG DETALHADO PARA INVESTIGAR DUPLICATAS
       if (Array.isArray(result)) {
         console.log('🔍 [DUPLICATA DEBUG] Analisando array direto:', result.length, 'itens');
         result.forEach((merchant, index) => {
           console.log(`🔍 [DUPLICATA DEBUG] Item ${index + 1}:`, {
             id: merchant.id,
             name: merchant.name,
             corporateName: merchant.corporateName
           });
         });
       } else if (result.merchants && Array.isArray(result.merchants)) {
         console.log('🔍 [DUPLICATA DEBUG] Analisando merchants do objeto:', result.merchants.length, 'itens');
         result.merchants.forEach((merchant, index) => {
           console.log(`🔍 [DUPLICATA DEBUG] Merchant ${index + 1}:`, {
             id: merchant.id,
             name: merchant.name,
             corporateName: merchant.corporateName
           });
         });
       }
       
       // Verificar se é a opção de cliente existente
       const isExistingClient = result.output === 'Clientes_existentes';
       console.log('🏢 É cliente existente?', isExistingClient);
       
       // Se é cliente existente mas não tem merchants, finalizar silenciosamente
       if (isExistingClient && (!result.merchants || !Array.isArray(result.merchants) || result.merchants.length === 0)) {
         console.log('🏢 Cliente existente sem merchants - finalizando silenciosamente no fetch');
         return {
           merchants: [],
           isExistingClient: true
         };
       }
       
       // O N8N retorna os dados em formato específico: array direto ou com output
       let merchants: IfoodMerchant[] = [];
      
             if (isExistingClient && result.merchants && Array.isArray(result.merchants)) {
         console.log('🏢 Processando CLIENTE EXISTENTE com', result.merchants.length, 'merchants');
         console.log('📋 Merchants do cliente existente:', result.merchants.map((item, index) => ({
           index,
           id: item.id,
           name: item.name,
           corporateName: item.corporateName
         })));
         
         // Processar merchants do cliente existente
         merchants = result.merchants.map((merchant, index) => {
           console.log(`📋 Processando merchant ${index + 1} (cliente existente):`, {
             id: merchant.id,
             name: merchant.name,
             corporateName: merchant.corporateName
           });
           
                     return {
            id: merchant.id,
            name: merchant.name,
            corporateName: merchant.corporateName,
            status: true, // Valor padrão - não depende da resposta do webhook
            description: merchant.description || undefined,
            cuisineTypes: merchant.cuisineTypes || undefined,
            phone: merchant.phone || undefined,
            address: merchant.address || undefined,
            operatingHours: merchant.operatingHours || undefined,
            deliveryMethods: merchant.deliveryMethods || undefined,
            paymentMethods: merchant.paymentMethods || undefined,
            averageDeliveryTime: merchant.averageDeliveryTime || undefined,
            minimumOrderValue: merchant.minimumOrderValue || undefined,
            deliveryFee: merchant.deliveryFee || undefined
          };
         });
       } else if (Array.isArray(result)) {
         console.log('📋 Processando array com', result.length, 'itens');
         console.log('📋 Itens do array:', result.map((item, index) => ({
           index,
           id: item.id,
           name: item.name,
           corporateName: item.corporateName
         })));
         
         // Se retornar array direto (formato atual do N8N)
         merchants = result.map((merchant, index) => {
           console.log(`📋 Processando merchant ${index + 1}:`, {
             id: merchant.id,
             name: merchant.name,
             corporateName: merchant.corporateName
           });
           
           return {
             id: merchant.id,
             name: merchant.name,
             corporateName: merchant.corporateName,
             status: true, // Valor padrão para status obrigatório
             description: merchant.description || undefined,
             cuisineTypes: merchant.cuisineTypes || undefined,
             phone: merchant.phone || undefined,
             address: merchant.address || undefined,
             operatingHours: merchant.operatingHours || undefined,
             deliveryMethods: merchant.deliveryMethods || undefined,
             paymentMethods: merchant.paymentMethods || undefined,
             averageDeliveryTime: merchant.averageDeliveryTime || undefined,
             minimumOrderValue: merchant.minimumOrderValue || undefined,
             deliveryFee: merchant.deliveryFee || undefined
           };
         });
      } else if (result.data && Array.isArray(result.data)) {
        // Se retornar objeto com propriedade data
        merchants = result.data.map(merchant => ({
          id: merchant.id,
          name: merchant.name,
          corporateName: merchant.corporateName,
          status: true, // Valor padrão - não depende da resposta do webhook
          description: merchant.description || undefined,
          cuisineTypes: merchant.cuisineTypes || undefined,
          phone: merchant.phone || undefined,
          address: merchant.address || undefined,
          operatingHours: merchant.operatingHours || undefined,
          deliveryMethods: merchant.deliveryMethods || undefined,
          paymentMethods: merchant.paymentMethods || undefined,
          averageDeliveryTime: merchant.averageDeliveryTime || undefined,
          minimumOrderValue: merchant.minimumOrderValue || undefined,
          deliveryFee: merchant.deliveryFee || undefined
        }));
      } else if (result.merchants && Array.isArray(result.merchants)) {
        // Se retornar objeto com propriedade merchants  
        merchants = result.merchants.map(merchant => ({
          id: merchant.id,
          name: merchant.name,
          corporateName: merchant.corporateName,
          status: true, // Valor padrão - não depende da resposta do webhook
          description: merchant.description || undefined,
          cuisineTypes: merchant.cuisineTypes || undefined,
          phone: merchant.phone || undefined,
          address: merchant.address || undefined,
          operatingHours: merchant.operatingHours || undefined,
          deliveryMethods: merchant.deliveryMethods || undefined,
          paymentMethods: merchant.paymentMethods || undefined,
          averageDeliveryTime: merchant.averageDeliveryTime || undefined,
          minimumOrderValue: merchant.minimumOrderValue || undefined,
          deliveryFee: merchant.deliveryFee || undefined
        }));
      } else if (result.id && result.name) {
        // Se retornar o objeto diretamente
        merchants = [{
          id: result.id,
          name: result.name,
          corporateName: result.corporateName,
          status: true, // Valor padrão - não depende da resposta do webhook
          description: result.description || undefined,
          cuisineTypes: result.cuisineTypes || undefined,
          phone: result.phone || undefined,
          address: result.address || undefined,
          operatingHours: result.operatingHours || undefined,
          deliveryMethods: result.deliveryMethods || undefined,
          paymentMethods: result.paymentMethods || undefined,
          averageDeliveryTime: result.averageDeliveryTime || undefined,
          minimumOrderValue: result.minimumOrderValue || undefined,
          deliveryFee: result.deliveryFee || undefined
        }];
      }
      
             console.log('✅ Merchants processados:', merchants.length);
       console.log('📋 Dados dos merchants após processamento:', merchants);
       
       // Se é cliente existente e não encontrou merchants, retornar array vazio sem erro
       if (isExistingClient && (!merchants || merchants.length === 0)) {
         console.log('🏢 Cliente existente - retornando lista vazia sem erro');
         return {
           merchants: [],
           isExistingClient: true
         };
       }

       return {
         merchants: merchants || [],
         isExistingClient
       };
    } catch (error) {
      console.error('❌ Erro ao buscar merchants via N8N:', error);
      throw error;
    }
  }

  // Salvar merchants na tabela ifood_merchants
  static async saveMerchantsToDatabase(merchants: IfoodMerchant[], userId: string, clientId?: string): Promise<void> {
    try {
      console.log(`💾 Salvando ${merchants.length} merchants no banco de dados...`);
      console.log(`💾 User ID:`, userId);
      console.log(`💾 Client ID:`, clientId);
      console.log(`💾 Merchants a serem salvos:`, merchants.map(m => ({
        id: m.id,
        name: m.name,
        corporateName: m.corporateName
      })));

      // Validar dados obrigatórios
      if (!userId) {
        throw new Error('User ID é obrigatório para salvar merchants');
      }

      if (merchants.length === 0) {
        console.log('⚠️ Nenhum merchant para salvar');
        return;
      }
      
      const merchantsToInsert = merchants.map((merchant, index) => {
        // Validar campos obrigatórios
        if (!merchant.id) {
          throw new Error(`Merchant ${index + 1}: ID é obrigatório`);
        }
        if (!merchant.name) {
          throw new Error(`Merchant ${index + 1}: Nome é obrigatório`);
        }

        const mappedMerchant = {
          merchant_id: String(merchant.id), // Garantir que seja string
          name: String(merchant.name), // Garantir que seja string
          corporate_name: merchant.corporateName || null,
          description: merchant.description || null,
          status: Boolean(merchant.status), // Garantir que seja boolean
          cuisine_types: merchant.cuisineTypes || null,
          phone: merchant.phone || null,
          address_street: merchant.address?.street || null,
          address_number: merchant.address?.number || null,
          address_complement: merchant.address?.complement || null,
          address_neighborhood: merchant.address?.neighborhood || null,
          address_city: merchant.address?.city || null,
          address_state: merchant.address?.state || null,
          address_zip_code: merchant.address?.zipCode || null,
          address_country: merchant.address?.country || null,
          operating_hours: merchant.operatingHours || null,
          delivery_methods: merchant.deliveryMethods || null,
          payment_methods: merchant.paymentMethods || null,
          average_delivery_time: merchant.averageDeliveryTime || null,
          minimum_order_value: merchant.minimumOrderValue || null,
          delivery_fee: merchant.deliveryFee || null,
          user_id: userId,
          client_id: clientId || null
        };
        
        console.log(`💾 Mapeando merchant ${index + 1}:`, {
          originalId: merchant.id,
          merchantId: mappedMerchant.merchant_id,
          name: mappedMerchant.name,
          status: mappedMerchant.status,
          userId: mappedMerchant.user_id
        });
        
        return mappedMerchant;
      });

      // ESTRATÉGIA DEFINITIVA: LIMPAR TUDO E INSERIR APENAS O QUE VEM DO N8N
      console.log('🧹 ESTRATÉGIA DEFINITIVA: Substituindo TODOS os merchants do usuário...');
      console.log(`🗑️ Limpando merchants existentes e inserindo ${merchantsToInsert.length} do N8N`);
      
      // 1. LIMPAR TODOS os merchants do usuário
      const { error: deleteError } = await supabase
        .from('ifood_merchants')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('❌ Erro ao limpar merchants existentes:', deleteError);
        throw new Error(`Erro ao limpar merchants: ${deleteError.message}`);
      }
      
      console.log('✅ Todos os merchants do usuário foram limpos');
      
      // 2. INSERIR APENAS o que veio do N8N
      console.log('📥 Inserindo', merchantsToInsert.length, 'merchants do N8N...');
      console.log('📋 Exemplo de dados:', JSON.stringify(merchantsToInsert.slice(0, 1), null, 2));
      
      // LOG DETALHADO: verificar dados vindos do N8N
      console.log('🔍 [N8N DEBUG] Analisando merchants vindos do N8N:');
      const merchantNames = new Map();
      const merchantIds = new Map();
      
      merchantsToInsert.forEach((merchant, index) => {
        console.log(`🔍 [N8N DEBUG] Merchant ${index + 1} do N8N:`, {
          merchant_id: merchant.merchant_id,
          name: merchant.name,
          corporate_name: merchant.corporate_name,
          user_id: merchant.user_id
        });
        
        // Verificar se o N8N está enviando duplicatas
        if (merchantNames.has(merchant.name)) {
          console.warn(`⚠️ [N8N DEBUG] N8N enviou NOME DUPLICADO: "${merchant.name}"`);
          console.warn(`⚠️ [N8N DEBUG] Primeiro merchant_id: ${merchantNames.get(merchant.name)}`);
          console.warn(`⚠️ [N8N DEBUG] Segundo merchant_id: ${merchant.merchant_id}`);
        } else {
          merchantNames.set(merchant.name, merchant.merchant_id);
        }
        
        // Verificar se o N8N está enviando merchant_ids duplicados
        if (merchantIds.has(merchant.merchant_id)) {
          console.warn(`⚠️ [N8N DEBUG] N8N enviou MERCHANT_ID DUPLICADO: ${merchant.merchant_id}`);
        } else {
          merchantIds.set(merchant.merchant_id, merchant.name);
        }
      });
      
      let successCount = 0;
      let errorCount = 0;
      
      // Inserir em lotes de 10 para evitar timeout
      const batchSize = 10;
      for (let i = 0; i < merchantsToInsert.length; i += batchSize) {
        const batch = merchantsToInsert.slice(i, i + batchSize);
        console.log(`📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(merchantsToInsert.length/batchSize)} (${batch.length} items)`);
        
        const { data, error } = await supabase
          .from('ifood_merchants')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, error);
          errorCount += batch.length;
        } else {
          console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} inserido com sucesso`);
          successCount += batch.length;
        }
      }
      
      console.log('📊 Resultado final:', {
        merchantsDoN8N: merchantsToInsert.length,
        merchantsInseridos: successCount,
        erros: errorCount
      });
      
      if (errorCount > 0) {
        throw new Error(`Erro ao inserir ${errorCount} de ${merchantsToInsert.length} merchants do N8N`);
      }
      
      console.log(`✅ ${successCount} merchants do N8N inseridos com sucesso - TABELA COMPLETAMENTE SUBSTITUÍDA!`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar merchants no banco:', error);
      throw error;
    }
  }

  // Função super simples para limpar duplicados (sem dependências de colunas específicas)
  static async simpleCleanupDuplicates(userId: string): Promise<void> {
    try {
      console.log('🧹 [SIMPLE] Limpeza de duplicados para userId:', userId);
      
      // Buscar usando apenas colunas básicas garantidas
      const { data: merchants, error } = await supabase
        .from('ifood_merchants')
        .select('id, merchant_id, name')
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ Erro ao buscar merchants:', error);
        return;
      }
      
      if (!merchants || merchants.length === 0) {
        console.log('📭 Nenhum merchant encontrado');
        return;
      }
      
      // Agrupar por merchant_id
      const groups = new Map<string, any[]>();
      merchants.forEach(merchant => {
        if (!groups.has(merchant.merchant_id)) {
          groups.set(merchant.merchant_id, []);
        }
        groups.get(merchant.merchant_id)!.push(merchant);
      });
      
      const toDelete: string[] = [];
      
      // Para cada grupo, manter apenas o primeiro, deletar o resto
      for (const [merchantId, list] of groups) {
        if (list.length > 1) {
          console.log(`🔍 Merchant ${merchantId}: ${list.length} duplicatas encontradas`);
          // Manter o primeiro, deletar o resto
          toDelete.push(...list.slice(1).map(m => m.id));
        }
      }
      
      // Deletar duplicadas 
      if (toDelete.length > 0) {
        console.log(`🗑️ Deletando ${toDelete.length} duplicatas`);
        
        const { error: deleteError } = await supabase
          .from('ifood_merchants')
          .delete()
          .in('id', toDelete);
        
        if (deleteError) {
          console.error('❌ Erro ao deletar duplicatas:', deleteError);
        } else {
          console.log(`✅ ${toDelete.length} duplicatas removidas com sucesso`);
        }
      } else {
        console.log('✅ Nenhuma duplicata encontrada');
      }
      
    } catch (error) {
      console.error('❌ Erro na limpeza simples:', error);
    }
  }

  // Função para limpar duplicados (método original - desabilitado para evitar erros de coluna)
  static async cleanupDuplicateMerchants(userId: string): Promise<void> {
    try {
      console.log('🧹 Verificando duplicados para usuário:', userId);
      
      // Buscar todos os merchants do usuário
      const { data: merchants, error } = await supabase
        .from('ifood_merchants')
        .select('id, merchant_id, name, created_at, last_sync_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar merchants para limpeza:', error);
        return;
      }

      if (!merchants || merchants.length === 0) {
        console.log('🧹 Nenhum merchant encontrado para limpeza');
        return;
      }

      // Agrupar por merchant_id para encontrar duplicados reais
      // (mesmo merchant_id + user_id deveria ser único pelo constraint)
      const merchantsByMerchantId = merchants.reduce((acc: any, merchant: any) => {
        if (!acc[merchant.merchant_id]) {
          acc[merchant.merchant_id] = [];
        }
        acc[merchant.merchant_id].push(merchant);
        return acc;
      }, {});

      let duplicatesFound = 0;
      let duplicatesRemoved = 0;

      // Identificar e remover duplicados
      for (const [merchantId, merchantList] of Object.entries(merchantsByMerchantId) as [string, any[]][]) {
        if (merchantList.length > 1) {
          duplicatesFound += merchantList.length - 1;
          console.log(`🧹 Encontrados ${merchantList.length} duplicados para merchant_id "${merchantId}":`, 
            merchantList.map(m => ({ 
              id: m.id, 
              name: m.name,
              created_at: m.created_at,
              last_sync_at: m.last_sync_at 
            })));
          
          // Manter o mais recente (baseado em last_sync_at, depois created_at)
          const sortedMerchants = merchantList.sort((a, b) => {
            // Priorizar por last_sync_at se existir
            if (a.last_sync_at && b.last_sync_at) {
              return new Date(b.last_sync_at).getTime() - new Date(a.last_sync_at).getTime();
            }
            if (a.last_sync_at && !b.last_sync_at) return -1;
            if (!a.last_sync_at && b.last_sync_at) return 1;
            
            // Senão, usar created_at
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          const correctMerchant = sortedMerchants[0]; // O mais recente
          const toDelete = sortedMerchants.slice(1); // Todos os outros
          
          console.log(`🧹 Mantendo merchant mais recente:`, {
            id: correctMerchant.id,
            merchant_id: correctMerchant.merchant_id,
            name: correctMerchant.name,
            last_sync_at: correctMerchant.last_sync_at,
            created_at: correctMerchant.created_at
          });
          console.log(`🧹 Deletando ${toDelete.length} duplicados mais antigos`);
          
          // Deletar os duplicados
          const idsToDelete = toDelete.map(m => m.id);
          const { error: deleteError } = await supabase
            .from('ifood_merchants')
            .delete()
            .in('id', idsToDelete);
            
          if (deleteError) {
            console.error('❌ Erro ao deletar duplicados:', deleteError);
          } else {
            duplicatesRemoved += toDelete.length;
            console.log(`✅ ${toDelete.length} duplicados removidos com sucesso`);
          }
        }
      }

      console.log(`🧹 Limpeza concluída - ${duplicatesFound} duplicados encontrados, ${duplicatesRemoved} removidos`);
      
    } catch (error) {
      console.error('❌ Erro na limpeza de duplicados:', error);
    }
  }

  // Atualizar campo ifood_merchant_id na tabela clients
  static async updateClientsWithMerchantIds(merchants: IfoodMerchant[], clientId?: string): Promise<void> {
    try {
      // Só atualizar se clientId foi fornecido
      if (!clientId) {
        console.log('🏢 Nenhum cliente específico fornecido - pulando atualização de cliente');
        return;
      }

      // Se há apenas um merchant, atualizar o cliente com esse ID
      if (merchants.length === 1) {
        const { error } = await supabase
          .from('clients')
          .update({ ifood_merchant_id: merchants[0].id })
          .eq('id', clientId);

        if (error) {
          throw error;
        }
        console.log(`🏢 Cliente ${clientId} atualizado com merchant_id: ${merchants[0].id}`);
      }
      // Se há múltiplos merchants, usar o primeiro
      else if (merchants.length > 0) {
        const { error } = await supabase
          .from('clients')
          .update({ ifood_merchant_id: merchants[0].id })
          .eq('id', clientId);

        if (error) {
          throw error;
        }
        console.log(`🏢 Cliente ${clientId} atualizado com merchant_id: ${merchants[0].id} (primeiro de ${merchants.length})`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente com merchant ID:', error);
      throw error;
    }
  }

  // Função robusta para limpeza de duplicatas
  static async forceCleanupAllDuplicates(userId: string): Promise<{
    success: boolean;
    duplicatesFound: number;
    duplicatesRemoved: number;
    error?: string;
  }> {
    try {
      console.log('🧹 [FORCE CLEANUP] Iniciando limpeza robusta de duplicatas para userId:', userId);
      
      // Buscar TODOS os merchants agrupados por merchant_id (usando apenas colunas básicas)
      const { data: allMerchants, error: fetchError } = await supabase
        .from('ifood_merchants')
        .select('id, merchant_id, name')
        .eq('user_id', userId);
      
      if (fetchError) {
        console.error('❌ Erro ao buscar merchants:', fetchError);
        throw fetchError;
      }
      
      if (!allMerchants || allMerchants.length === 0) {
        console.log('📭 Nenhum merchant encontrado para limpeza');
        return { success: true, duplicatesFound: 0, duplicatesRemoved: 0 };
      }
      
      console.log(`📊 Total de merchants encontrados: ${allMerchants.length}`);
      
      // Agrupar por merchant_id e manter apenas o mais recente de cada grupo
      const merchantGroups = new Map<string, any[]>();
      
      allMerchants.forEach(merchant => {
        if (!merchantGroups.has(merchant.merchant_id)) {
          merchantGroups.set(merchant.merchant_id, []);
        }
        merchantGroups.get(merchant.merchant_id)!.push(merchant);
      });
      
      const toDelete: string[] = [];
      let duplicatesFound = 0;
      
      // Para cada grupo, manter apenas o mais recente
      for (const [merchantId, merchants] of merchantGroups) {
        if (merchants.length > 1) {
          duplicatesFound += merchants.length - 1;
          console.log(`🔍 Merchant ${merchantId} tem ${merchants.length} duplicatas`);
          
          // Manter o primeiro da lista, deletar o resto (ordem não importa pois vamos sincronizar tudo novo)
          const toKeep = merchants[0];
          const toDeleteFromGroup = merchants.slice(1);
          
          console.log(`📌 Mantendo: ${toKeep.name} (${toKeep.id})`);
          console.log(`🗑️ Deletando ${toDeleteFromGroup.length} duplicatas`);
          
          toDelete.push(...toDeleteFromGroup.map(m => m.id));
        }
      }
      
      console.log(`🧹 Total de duplicatas encontradas: ${duplicatesFound}`);
      console.log(`🗑️ IDs para deletar: ${toDelete.length}`);
      
      let duplicatesRemoved = 0;
      
      // Deletar em lotes para evitar timeout
      if (toDelete.length > 0) {
        const batchSize = 50; // Processar em lotes de 50
        
        for (let i = 0; i < toDelete.length; i += batchSize) {
          const batch = toDelete.slice(i, i + batchSize);
          console.log(`🔄 Deletando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(toDelete.length/batchSize)} (${batch.length} items)`);
          
          const { error: deleteError } = await supabase
            .from('ifood_merchants')
            .delete()
            .in('id', batch);
          
          if (deleteError) {
            console.error('❌ Erro ao deletar lote:', deleteError);
            throw deleteError;
          }
          
          duplicatesRemoved += batch.length;
        }
        
        console.log(`✅ ${duplicatesRemoved} duplicatas removidas com sucesso`);
      }
      
      return {
        success: true,
        duplicatesFound,
        duplicatesRemoved
      };
      
    } catch (error) {
      console.error('❌ Erro na limpeza robusta de duplicatas:', error);
      return {
        success: false,
        duplicatesFound: 0,
        duplicatesRemoved: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido na limpeza'
      };
    }
  }

  // Função para limpeza manual de duplicatas
  static async manualCleanupDuplicates(userId: string): Promise<{
    success: boolean;
    duplicatesFound: number;
    duplicatesRemoved: number;
    error?: string;
  }> {
    try {
      console.log('🧹 [MANUAL CLEANUP] Iniciando limpeza manual de duplicatas...');
      
      // Primeiro verificar quantas duplicatas existem
      const { data: allMerchants, error: fetchError } = await supabase
        .from('ifood_merchants')
        .select('id, merchant_id, name')
        .eq('user_id', userId);
      
      if (fetchError) {
        console.error('❌ Erro ao buscar merchants:', fetchError);
        throw fetchError;
      }
      
      if (!allMerchants || allMerchants.length === 0) {
        console.log('📭 Nenhum merchant encontrado');
        return { success: true, duplicatesFound: 0, duplicatesRemoved: 0 };
      }
      
      // Agrupar por merchant_id para contar duplicatas
      const merchantGroups = new Map<string, any[]>();
      allMerchants.forEach(merchant => {
        if (!merchantGroups.has(merchant.merchant_id)) {
          merchantGroups.set(merchant.merchant_id, []);
        }
        merchantGroups.get(merchant.merchant_id)!.push(merchant);
      });
      
      let duplicatesFound = 0;
      for (const [merchantId, merchants] of merchantGroups) {
        if (merchants.length > 1) {
          duplicatesFound += merchants.length - 1;
          console.log(`🔍 [MANUAL CLEANUP] Merchant ${merchantId} (${merchants[0].name}) tem ${merchants.length} duplicatas`);
        }
      }
      
      if (duplicatesFound === 0) {
        console.log('✅ [MANUAL CLEANUP] Nenhuma duplicata encontrada');
        return { success: true, duplicatesFound: 0, duplicatesRemoved: 0 };
      }
      
      console.log(`⚠️ [MANUAL CLEANUP] ${duplicatesFound} duplicatas encontradas, iniciando limpeza...`);
      
      // Chamar a função robusta de limpeza
      return this.forceCleanupAllDuplicates(userId);
      
    } catch (error) {
      console.error('❌ Erro na limpeza manual:', error);
      return {
        success: false,
        duplicatesFound: 0,
        duplicatesRemoved: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido na limpeza manual'
      };
    }
  }

  // Função para verificar constraint da tabela (versão simplificada)
  static async verifyTableConstraints(userId: string): Promise<void> {
    try {
      console.log('🔍 [CONSTRAINT DEBUG] Verificando duplicatas existentes na tabela...');
      
      // Verificar se já existem duplicatas na tabela
      const { data: existingMerchants, error } = await supabase
        .from('ifood_merchants')
        .select('id, merchant_id, name, user_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ Erro ao verificar merchants existentes:', error);
        return;
      }
      
      if (!existingMerchants || existingMerchants.length === 0) {
        console.log('📭 [CONSTRAINT DEBUG] Nenhum merchant existente encontrado');
        return;
      }
      
      console.log(`📊 [CONSTRAINT DEBUG] Total de merchants existentes: ${existingMerchants.length}`);
      
      // Verificar duplicatas por merchant_id
      const merchantIdCounts = new Map<string, number>();
      const duplicatesInfo: any[] = [];
      
      existingMerchants.forEach(merchant => {
        const count = merchantIdCounts.get(merchant.merchant_id) || 0;
        merchantIdCounts.set(merchant.merchant_id, count + 1);
        
        if (count > 0) {
          duplicatesInfo.push({
            merchant_id: merchant.merchant_id,
            name: merchant.name,
            database_id: merchant.id
          });
        }
      });
      
      const duplicateIds = Array.from(merchantIdCounts.entries()).filter(([id, count]) => count > 1);
      
      if (duplicateIds.length > 0) {
        console.warn('⚠️ [CONSTRAINT DEBUG] DUPLICATAS ENCONTRADAS na tabela:');
        duplicateIds.forEach(([merchantId, count]) => {
          console.warn(`⚠️ [CONSTRAINT DEBUG] Merchant ID ${merchantId}: ${count} duplicatas`);
        });
        console.warn('⚠️ [CONSTRAINT DEBUG] Detalhes das duplicatas:', duplicatesInfo);
        console.warn('⚠️ [CONSTRAINT DEBUG] A constraint UNIQUE (merchant_id, user_id) NÃO está funcionando!');
      } else {
        console.log('✅ [CONSTRAINT DEBUG] Nenhuma duplicata encontrada - constraint funcionando corretamente');
      }
      
    } catch (error) {
      console.error('❌ Erro na verificação da tabela:', error);
    }
  }

  // Função principal para sincronizar merchants (POST para N8N + GET da tabela)
  static async syncMerchants(userId: string, clientId?: string): Promise<{
    success: boolean;
    merchants: IfoodMerchant[];
    error?: string;
  }> {
    try {
      console.log(`🚀 [SYNC] Sincronizando merchants para usuário ${userId}`);
      console.log('📋 ESTRATÉGIA: POST para N8N + GET da tabela');
      
      // 1. Chamar webhook N8N (POST)
      console.log('📡 Chamando webhook N8N...');
      await this.callN8NWebhook(userId);
      
      // 2. Aguardar processamento do N8N
      console.log('⏳ Aguardando N8N processar...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 3. Buscar dados atualizados da tabela (GET)
      console.log('📖 Buscando dados atualizados da tabela...');
      const syncedMerchants = await this.getMerchantsFromDatabase(userId);
      
      console.log(`✅ Sincronização concluída! ${syncedMerchants.length} merchants na tabela`);
      console.log('📋 Merchants sincronizados:', syncedMerchants.map(m => ({ id: m.id, name: m.name })));
      
      return {
        success: true,
        merchants: syncedMerchants
      };
 
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return {
        success: false,
        merchants: [],
        error: error instanceof Error ? error.message : 'Erro na sincronização'
      };
    }
  }

  // Nova função para apenas buscar merchants da tabela (GET apenas)
  static async getMerchantsFromDatabase(userId: string): Promise<IfoodMerchant[]> {
    try {
      console.log('📖 [GET ONLY] Buscando merchants da tabela para usuário:', userId);
      
      const { data: merchants, error } = await supabase
        .from('ifood_merchants')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        console.error('❌ Erro ao buscar merchants da tabela:', error);
        throw error;
      }
      
      const count = merchants?.length || 0;
      console.log(`📊 [GET ONLY] ${count} merchants encontrados na tabela`);
      
      return merchants || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar merchants do banco:', error);
      throw error;
    }
  }

  // Função para chamar webhook N8N (POST) - VERSÃO ORIGINAL QUE FUNCIONAVA
  static async callN8NWebhook(userId: string): Promise<void> {
    try {
      console.log('📡 [N8N WEBHOOK] Chamando versão original que funcionava...');
      
      // Buscar token do usuário (igual ao fetchMerchants original)
      const tokenResult = await this.getValidToken(userId);
      if (!tokenResult.token) {
        throw new Error(tokenResult.error || 'Token de acesso não encontrado ou inválido');
      }
      
      console.log('📡 Endpoint N8N ORIGINAL:', 'https://webhook.n8n.hml.planocertodelivery.com/webhook/merchant');
      console.log('🔑 Enviando token para N8N...');
      
      // Usar exatamente a mesma implementação que funcionava no fetchMerchants
      const response = await fetch('https://webhook.n8n.hml.planocertodelivery.com/webhook/merchant', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: tokenResult.token,
          user_id: userId
        })
      });
      
      console.log('📊 Status da resposta N8N:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na requisição N8N:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        if (response.status === 401) {
          throw new Error('Token expirado ou inválido. Faça login novamente no iFood.');
        }
        
        throw new Error(`Erro na requisição N8N: ${response.status} - ${response.statusText}. Detalhes: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ [N8N WEBHOOK] Resposta do N8N:', result);
      
    } catch (error) {
      console.error('❌ [N8N WEBHOOK] Erro ao chamar webhook:', error);
      throw error;
    }
  }

  // === MONITORAMENTO AUTOMÁTICO DE STATUS ===
  
  // Função para verificar status de todos os merchants de um usuário
  static async checkMerchantsStatus(userId: string): Promise<{
    success: boolean;
    merchants: Array<{
      id: string;
      merchant_id: string;
      name: string;
      status: boolean;
      lastChecked: string;
      statusChanged: boolean;
      previousStatus?: boolean;
    }>;
    summary: {
      total: number;
      available: number;
      unavailable: number;
      changed: number;
    };
    error?: string;
  }> {
    try {
      console.log('🔍 [STATUS CHECK] Verificando status de merchants para usuário:', userId);
      
      // Buscar todos os merchants do usuário
      const { data: merchants, error } = await supabase
        .from('ifood_merchants')
        .select('id, merchant_id, name, status, updated_at, last_status_check')
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        console.error('❌ [STATUS CHECK] Erro ao buscar merchants:', error);
        throw error;
      }
      
      if (!merchants || merchants.length === 0) {
        console.log('📭 [STATUS CHECK] Nenhum merchant encontrado para monitorar');
        return {
          success: true,
          merchants: [],
          summary: { total: 0, available: 0, unavailable: 0, changed: 0 }
        };
      }
      
      console.log(`📊 [STATUS CHECK] Verificando ${merchants.length} merchants...`);
      const currentTime = new Date().toISOString();
      const checkedMerchants = [];
      let changedCount = 0;
      
      for (const merchant of merchants) {
        // Simular verificação de status (aqui você pode implementar chamada real para API)
        const previousStatus = merchant.status;
        
        // Por enquanto, mantém status atual (posteriormente pode implementar verificação real)
        const currentStatus = merchant.status;
        const statusChanged = previousStatus !== currentStatus;
        
        if (statusChanged) {
          changedCount++;
          console.log(`🔄 [STATUS CHECK] Status mudou para ${merchant.name}: ${previousStatus} → ${currentStatus}`);
          
          // Atualizar timestamp da última verificação na tabela
          await supabase
            .from('ifood_merchants')
            .update({ 
              last_status_check: currentTime,
              status: currentStatus 
            })
            .eq('id', merchant.id);
        }
        
        checkedMerchants.push({
          id: merchant.id,
          merchant_id: merchant.merchant_id,
          name: merchant.name,
          status: currentStatus,
          lastChecked: currentTime,
          statusChanged,
          previousStatus: statusChanged ? previousStatus : undefined
        });
      }
      
      const summary = {
        total: merchants.length,
        available: checkedMerchants.filter(m => m.status === true).length,
        unavailable: checkedMerchants.filter(m => m.status === false).length,
        changed: changedCount
      };
      
      console.log('📊 [STATUS CHECK] Resumo:', summary);
      
      return {
        success: true,
        merchants: checkedMerchants,
        summary
      };
      
    } catch (error) {
      console.error('❌ [STATUS CHECK] Erro na verificação de status:', error);
      return {
        success: false,
        merchants: [],
        summary: { total: 0, available: 0, unavailable: 0, changed: 0 },
        error: error instanceof Error ? error.message : 'Erro desconhecido na verificação'
      };
    }
  }

  // Gerenciamento do monitoramento automático
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;
  
  // Função para iniciar monitoramento automático
  static startAutomaticMonitoring(userId: string, intervalMinutes: number = 5): {
    success: boolean;
    message: string;
  } {
    try {
      if (this.isMonitoring) {
        console.log('⚠️ [AUTO MONITOR] Monitoramento já está ativo');
        return {
          success: false,
          message: 'Monitoramento automático já está ativo'
        };
      }
      
      console.log(`🚀 [AUTO MONITOR] Iniciando monitoramento automático a cada ${intervalMinutes} minutos`);
      
      // Executar primeira verificação imediatamente
      this.checkMerchantsStatus(userId).then(result => {
        console.log('📊 [AUTO MONITOR] Primeira verificação concluída:', result.summary);
      });
      
      // Configurar intervalo automático
      const intervalMs = intervalMinutes * 60 * 1000;
      this.monitoringInterval = setInterval(async () => {
        console.log('🔄 [AUTO MONITOR] Executando verificação automática...');
        const result = await this.checkMerchantsStatus(userId);
        
        if (result.summary.changed > 0) {
          console.log(`🔔 [AUTO MONITOR] ${result.summary.changed} lojas mudaram de status!`);
          
          // Enviar notificações de mudança
          result.merchants
            .filter(merchant => merchant.statusChanged)
            .forEach(merchant => {
              const statusText = merchant.status ? 'DISPONÍVEL' : 'INDISPONÍVEL';
              const previousStatusText = merchant.previousStatus ? 'DISPONÍVEL' : 'INDISPONÍVEL';
              
              console.log(`🔔 [NOTIFICATION] ${merchant.name}: ${previousStatusText} → ${statusText}`);
              
              // Armazenar notificação para ser enviada ao front-end
              this.sendStatusChangeNotification({
                merchantId: merchant.merchant_id,
                merchantName: merchant.name,
                newStatus: merchant.status,
                previousStatus: merchant.previousStatus,
                timestamp: merchant.lastChecked
              });
            });
        }
      }, intervalMs);
      
      this.isMonitoring = true;
      
      return {
        success: true,
        message: `Monitoramento iniciado - verificação a cada ${intervalMinutes} minutos`
      };
      
    } catch (error) {
      console.error('❌ [AUTO MONITOR] Erro ao iniciar monitoramento:', error);
      return {
        success: false,
        message: 'Erro ao iniciar monitoramento automático'
      };
    }
  }
  
  // Função para parar monitoramento automático
  static stopAutomaticMonitoring(): {
    success: boolean;
    message: string;
  } {
    try {
      if (!this.isMonitoring) {
        console.log('⚠️ [AUTO MONITOR] Monitoramento não está ativo');
        return {
          success: false,
          message: 'Monitoramento automático não está ativo'
        };
      }
      
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      this.isMonitoring = false;
      console.log('🛑 [AUTO MONITOR] Monitoramento automático parado');
      
      return {
        success: true,
        message: 'Monitoramento automático parado'
      };
      
    } catch (error) {
      console.error('❌ [AUTO MONITOR] Erro ao parar monitoramento:', error);
      return {
        success: false,
        message: 'Erro ao parar monitoramento automático'
      };
    }
  }
  
  // Função para verificar se monitoramento está ativo
  static isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  // === SISTEMA DE NOTIFICAÇÕES ===
  
  private static notificationCallbacks: Array<(notification: StatusChangeNotification) => void> = [];
  
  // Função para registrar callback de notificação
  static onStatusChange(callback: (notification: StatusChangeNotification) => void): () => void {
    this.notificationCallbacks.push(callback);
    console.log('📞 [NOTIFICATIONS] Callback registrado para notificações');
    
    // Retornar função para remover o callback
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
        console.log('📞 [NOTIFICATIONS] Callback removido');
      }
    };
  }
  
  // Função para enviar notificação de mudança de status
  private static sendStatusChangeNotification(notification: StatusChangeNotification): void {
    console.log('🔔 [NOTIFICATIONS] Enviando notificação:', notification);
    
    // Notificar todos os callbacks registrados
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('❌ [NOTIFICATIONS] Erro no callback:', error);
      }
    });
    
    // Tentativa de notificação do navegador (se permitido)
    this.tryBrowserNotification(notification);
  }
  
  // Função para tentar notificação do navegador
  private static tryBrowserNotification(notification: StatusChangeNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const statusText = notification.newStatus ? 'DISPONÍVEL' : 'INDISPONÍVEL';
      const title = 'Status da Loja Alterado';
      const body = `${notification.merchantName} agora está ${statusText}`;
      
      const browserNotification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `merchant-${notification.merchantId}`, // Evitar notificações duplicadas
        requireInteraction: false,
        silent: false
      });
      
      // Fechar automaticamente após 5 segundos
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
      
      console.log('🔔 [BROWSER NOTIFICATION] Notificação do navegador enviada');
    } else {
      console.log('📵 [BROWSER NOTIFICATION] Notificações do navegador não disponíveis ou não permitidas');
    }
  }
  
  // Função para solicitar permissão de notificação do navegador
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 [NOTIFICATIONS] Permissão de notificação:', permission);
      return permission;
    } else {
      console.log('📵 [NOTIFICATIONS] Notificações do navegador não suportadas');
      return 'denied';
    }
  }
}

// Interface para notificações de mudança de status (fora da classe)
export interface StatusChangeNotification {
  merchantId: string;
  merchantName: string;
  newStatus: boolean;
  previousStatus?: boolean;
  timestamp: string;
} 