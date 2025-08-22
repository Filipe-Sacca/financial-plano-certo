import axios from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

interface Product {
  item_id: string;
  name: string;
  category: string | null;
  description: string | null;
  merchant_id: string;
  is_active: string;
  price: number | null;
  imagePath: string | null;
  product_id: string;
  client_id?: string;  // client_id é opcional pois vamos buscar do merchant
}

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  status: string;
  productId: string;
  imagePath: string;
  price: {
    value: number;
  };
  categoryName?: string;  // Adicionado pela nossa lógica
}

interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  total_products?: number;
  new_products?: number;
  updated_products?: number;
}

interface CreateCategoryRequest {
  id: string;
  name: string;
  externalCode: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  index: number;
  template: 'DEFAULT' | 'PIZZA' | 'COMBO';
}

interface CreateCategoryResponse {
  success: boolean;
  data?: {
    categoryId: string;
    merchantId: string;
    catalogId: string;
    name?: string;
  };
  error?: string;
}

export class IFoodProductService {
  private supabase: SupabaseClient;
  private readonly IFOOD_API_BASE_URL = 'https://merchant-api.ifood.com.br';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Sincronizar produtos seguindo o fluxo especificado:
   * 1. Buscar token no banco
   * 2. Buscar merchant_id no banco
   * 3. Buscar catalog_id da API do iFood
   * 4. Buscar produtos da API do iFood
   * 5. Salvar produtos no banco
   */
  async syncProducts(userId: string, accessToken?: string): Promise<ServiceResponse> {
    try {
      console.log(`🛍️ [PRODUCT SYNC] Iniciando sincronização de produtos para usuário: ${userId}`);

      // 1. Buscar token de acesso no banco de dados
      let token = accessToken;
      if (!token) {
        console.log('🔍 [STEP 1] Buscando token de acesso no banco de dados...');
        console.log('🔍 [TOKEN QUERY] user_id procurado:', userId);
        
        const { data: tokenData, error: tokenError } = await this.supabase
          .from('ifood_tokens')
          .select('access_token, client_id, created_at, token_updated_at')
          .eq('user_id', userId)
          .single();

        console.log('📊 [TOKEN RESULT] Token encontrado:', !!tokenData);
        console.log('📊 [TOKEN RESULT] Client ID:', tokenData?.client_id || 'N/A');
        console.log('❌ [TOKEN ERROR] Erro:', tokenError?.message || 'Nenhum');
        
        if (tokenError || !tokenData?.access_token) {
          console.error('❌ [TOKEN FAILURE] Token não encontrado para user_id:', userId);
          console.error('❌ [TOKEN FAILURE] Erro detalhado:', tokenError);
          return {
            success: false,
            error: 'Token de acesso não encontrado. Faça login no iFood primeiro.'
          };
        }

        token = tokenData.access_token;
        console.log('✅ [TOKEN SUCCESS] Token obtido, tamanho:', token?.length || 0);
        console.log('✅ [STEP 1] Token encontrado no banco de dados');
      }

      // 2. Buscar merchant_id no banco de dados
      console.log('🔍 [STEP 2] Buscando merchants no banco de dados...');
      const { data: merchants, error: merchantsError } = await this.supabase
        .from('ifood_merchants')
        .select('merchant_id, name, client_id')
        .eq('user_id', userId);

      if (merchantsError || !merchants || merchants.length === 0) {
        return {
          success: false,
          error: 'Nenhum merchant encontrado. Sincronize as lojas primeiro.'
        };
      }

      console.log(`✅ [STEP 2] ${merchants.length} merchants encontrados no banco`);

      let totalProducts = 0;
      let newProducts = 0;
      let updatedProducts = 0;

      // Processar cada merchant
      for (const merchant of merchants) {
        try {
          console.log(`🔄 [PROCESSING] Merchant: ${merchant.name} (${merchant.merchant_id})`);
          
          const result = await this.processMerchantProducts(
            merchant.merchant_id, 
            merchant.client_id,
            token!
          );

          totalProducts += result.total || 0;
          newProducts += result.new || 0;
          updatedProducts += result.updated || 0;

        } catch (error) {
          console.error(`❌ [ERROR] Merchant ${merchant.merchant_id}:`, error);
          continue;
        }
      }

      console.log(`✅ [PRODUCT SYNC] Sincronização concluída:`, {
        totalProducts,
        newProducts,
        updatedProducts
      });

      return {
        success: true,
        data: {
          merchants_processed: merchants.length,
          total_products: totalProducts,
          new_products: newProducts,
          updated_products: updatedProducts
        },
        total_products: totalProducts,
        new_products: newProducts,
        updated_products: updatedProducts
      };

    } catch (error: any) {
      console.error('❌ [PRODUCT SYNC] Erro geral na sincronização:', error);
      return {
        success: false,
        error: error.message || 'Erro interno ao sincronizar produtos'
      };
    }
  }

  /**
   * Processar produtos de um merchant específico seguindo o fluxo:
   * 3. Buscar catalog_id da API do iFood v2.0
   * 4. Buscar categorias e produtos da API do iFood v2.0
   * 5. Salvar produtos no banco
   */
  private async processMerchantProducts(merchantId: string, clientId: string, accessToken: string): Promise<{
    total: number;
    new: number;
    updated: number;
  }> {
    try {
      // 3. Buscar catalog_id da API do iFood v2.0
      console.log(`🔍 [STEP 3] Buscando catálogos do merchant ${merchantId} (v2.0)...`);
      const catalogsUrl = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/catalogs`;
      
      let catalogId: string;
      
      try {
        const catalogsResponse = await axios.get(catalogsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        const catalogsData = catalogsResponse.data;
        
        // A API retorna um array de catálogos
        if (!catalogsData || !Array.isArray(catalogsData) || catalogsData.length === 0) {
          console.log(`📭 [STEP 3] Nenhum catálogo encontrado para merchant ${merchantId}`);
          return { total: 0, new: 0, updated: 0 };
        }
        
        // Pegar o primeiro catálogo disponível (geralmente o principal)
        const catalog = catalogsData[0];
        catalogId = catalog.catalogId || catalog.id;
        console.log(`✅ [STEP 3] Catálogo encontrado: ${catalogId} de ${catalogsData.length} catálogo(s) disponível(is)`);
        
      } catch (error: any) {
        console.error(`❌ [STEP 3] Erro ao buscar catálogo v2.0:`, error.response?.data || error.message);
        return { total: 0, new: 0, updated: 0 };
      }

      let allProducts: ApiProduct[] = [];

      // 4. Buscar produtos da API do iFood v2.0 usando o catalogId obtido
      try {
        console.log(`🔍 [STEP 4] Buscando categorias e produtos do catálogo ${catalogId} (v2.0)...`);
        
        const productsUrl = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories?includeItems=true&include_items=true`;
        
        const productsResponse = await axios.get(productsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        const categoriesData = productsResponse.data;
        
        // Extrair produtos de todas as categorias
        if (categoriesData && Array.isArray(categoriesData)) {
          for (const category of categoriesData) {
            if (category.items && category.items.length > 0) {
              // Adicionar categoria a cada produto
              const productsWithCategory = category.items.map((item: any) => ({
                ...item,
                categoryName: category.name || 'Sem categoria'
              }));
              allProducts = allProducts.concat(productsWithCategory);
              console.log(`  📦 Categoria "${category.name || 'Sem nome'}": ${category.items.length} produtos`);
            }
          }
        }

        console.log(`✅ [STEP 4] Total de produtos encontrados: ${allProducts.length}`);

      } catch (error: any) {
        console.error(`❌ [STEP 4] Erro ao buscar produtos do catálogo ${catalogId}:`, error.response?.data || error.message);
        return { total: 0, new: 0, updated: 0 };
      }

      if (allProducts.length === 0) {
        console.log(`📭 [STEP 4] Nenhum produto encontrado para merchant ${merchantId}`);
        return { total: 0, new: 0, updated: 0 };
      }

      console.log(`📦 [STEP 4] Total de produtos encontrados: ${allProducts.length}`);

      // 5. Salvar produtos no banco de dados
      console.log(`💾 [STEP 5] Salvando produtos no banco de dados...`);
      let newCount = 0;
      let updatedCount = 0;

      for (const apiProduct of allProducts) {
        try {
          const product: Product = {
            item_id: apiProduct.id,
            name: apiProduct.name,
            category: apiProduct.categoryName || null,
            description: apiProduct.description || null,
            merchant_id: merchantId,
            is_active: apiProduct.status,
            price: apiProduct.price?.value || null,
            imagePath: apiProduct.imagePath || null,
            product_id: apiProduct.productId || apiProduct.id,
            client_id: clientId
          };

          // Verificar se produto já existe
          const { data: existingProduct } = await this.supabase
            .from('products')
            .select('id, is_active, price, name')
            .eq('item_id', product.item_id)
            .eq('merchant_id', merchantId)
            .single();

          if (existingProduct) {
            // Atualizar se houver mudanças
            if (existingProduct.is_active !== product.is_active || 
                existingProduct.price !== product.price ||
                existingProduct.name !== product.name) {
              
              await this.supabase
                .from('products')
                .update({
                  is_active: product.is_active,
                  price: product.price,
                  name: product.name,
                  description: product.description,
                  imagePath: product.imagePath,
                  updated_at: new Date().toISOString()
                })
                .eq('item_id', product.item_id)
                .eq('merchant_id', merchantId);

              updatedCount++;
              console.log(`🔄 [STEP 5] Produto atualizado: ${product.name}`);
            }
          } else {
            // Criar novo produto
            const { error: insertError } = await this.supabase
              .from('products')
              .insert(product);

            if (insertError) {
              console.error(`❌ [STEP 5] Erro ao inserir produto ${product.name}:`, insertError);
            } else {
              newCount++;
              console.log(`➕ [STEP 5] Novo produto adicionado: ${product.name}`);
            }
          }

        } catch (error) {
          console.error(`❌ [STEP 5] Erro ao processar produto ${apiProduct.id}:`, error);
          continue;
        }
      }

      console.log(`✅ [STEP 5] Produtos salvos: ${newCount} novos, ${updatedCount} atualizados`);

      return {
        total: allProducts.length,
        new: newCount,
        updated: updatedCount
      };

    } catch (error: any) {
      console.error(`❌ [ERROR] Erro ao processar produtos do merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Criar uma nova categoria no catálogo do iFood
   * Endpoint: POST /catalog/v2.0/merchants/{merchantId}/catalogs/{catalogId}/categories
   */
  async createCategory(userId: string, merchantId: string, categoryData: Omit<CreateCategoryRequest, 'id'>, accessToken?: string): Promise<CreateCategoryResponse> {
    try {
      console.log(`🏪 [CREATE CATEGORY] Iniciando criação de categoria para merchant: ${merchantId}`);
      console.log(`📝 [CREATE CATEGORY] Dados da categoria:`, categoryData);

      // 1. Usar token fornecido ou buscar no banco
      let token = accessToken;
      
      if (!token) {
        console.log('🔍 [STEP 1] Buscando token de acesso no banco...');
        const { data: tokenData, error: tokenError } = await this.supabase
          .from('ifood_tokens')
          .select('access_token')
          .eq('user_id', userId)
          .single();

        if (tokenError || !tokenData?.access_token) {
          console.error('❌ [TOKEN FAILURE] Token não encontrado para user_id:', userId);
          return {
            success: false,
            error: 'Token de acesso não encontrado. Faça login no iFood primeiro.'
          };
        }

        token = tokenData.access_token;
        console.log('✅ [STEP 1] Token obtido do banco com sucesso');
      } else {
        console.log('✅ [STEP 1] Usando token fornecido via parâmetro');
      }

      // 2. Buscar catalog_id via API do iFood
      console.log('🔍 [STEP 2] Buscando catalog_id do merchant...');
      const catalogsUrl = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/catalogs`;
      
      let catalogId: string;
      try {
        const catalogsResponse = await axios.get(catalogsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const catalogsData = catalogsResponse.data;
        if (!catalogsData || !Array.isArray(catalogsData) || catalogsData.length === 0) {
          return {
            success: false,
            error: 'Nenhum catálogo encontrado para este merchant'
          };
        }

        catalogId = catalogsData[0].catalogId || catalogsData[0].id;
        console.log(`✅ [STEP 2] Catalog ID encontrado: ${catalogId}`);
        
      } catch (error: any) {
        console.error('❌ [STEP 2] Erro ao buscar catálogo:', error.response?.data || error.message);
        return {
          success: false,
          error: 'Erro ao buscar catálogo do merchant'
        };
      }

      // 3. Criar categoria usando merchantId como ID da categoria
      console.log('📦 [STEP 3] Criando categoria no iFood...');
      const createCategoryUrl = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories`;
      
      // Gerar ID único para a categoria
      const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Criar body com formato correto para a API do iFood
      const requestBody: any = {
        name: categoryData.name,
        status: categoryData.status, // iFood usa AVAILABLE/UNAVAILABLE
        index: categoryData.index,
        template: categoryData.template === 'PIZZA' ? 'PIZZA' : 'DEFAULT' // Apenas DEFAULT ou PIZZA
      };
      
      // Adicionar campos opcionais apenas se fornecidos
      if (categoryData.externalCode) {
        requestBody.externalCode = categoryData.externalCode;
      }

      console.log('🌐 [API REQUEST] URL:', createCategoryUrl);
      console.log('📤 [API REQUEST] Body:', requestBody);

      try {
        const createResponse = await axios.post(createCategoryUrl, requestBody, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ [STEP 3] Categoria criada com sucesso');
        console.log('📥 [API RESPONSE] Status:', createResponse.status);
        console.log('📥 [API RESPONSE] Data:', createResponse.data);

        // 4. Salvar categoria local para referência futura (opcional)
        try {
          await this.supabase
            .from('ifood_categories')
            .insert({
              category_id: categoryId,
              ifood_category_id: createResponse.data.id, // ID retornado pela API do iFood
              merchant_id: merchantId,
              catalog_id: catalogId,
              name: requestBody.name,
              external_code: requestBody.externalCode,
              status: requestBody.status,
              index: requestBody.index,
              template: requestBody.template,
              sequence_number: createResponse.data.sequence || createResponse.data.index || requestBody.index,
              user_id: userId,
              created_at: new Date().toISOString()
            });

          console.log('💾 [STEP 4] Categoria salva localmente com ID do iFood:', createResponse.data.id);
        } catch (localError) {
          console.warn('⚠️ [STEP 4] Erro ao salvar categoria localmente:', localError);
          // Não falhar por erro local
        }

        return {
          success: true,
          data: {
            categoryId: categoryId,
            merchantId: merchantId,
            catalogId: catalogId,
            name: categoryData.name
          }
        };

      } catch (error: any) {
        console.error('❌ [STEP 3] Erro ao criar categoria:', error.response?.data || error.message);
        console.error('❌ [STEP 3] Detalhes completos do erro:', JSON.stringify(error.response?.data, null, 2));
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Erro ao criar categoria no iFood'
        };
      }

    } catch (error: any) {
      console.error('❌ [CREATE CATEGORY] Erro geral:', error);
      return {
        success: false,
        error: error.message || 'Erro interno ao criar categoria'
      };
    }
  }

  /**
   * Sincronizar todas as categorias do iFood para o banco de dados
   * Busca categorias existentes na API e salva localmente
   */
  async syncCategories(userId: string, merchantId: string, accessToken?: string): Promise<{success: boolean; data?: any; error?: string}> {
    try {
      console.log(`📂 [SYNC CATEGORIES] Iniciando sincronização de categorias para merchant: ${merchantId}`);

      // 1. Usar token fornecido ou buscar no banco
      let token = accessToken;
      if (!token) {
        console.log('🔍 [STEP 1] Buscando token de acesso no banco...');
        const { data: tokenData, error: tokenError } = await this.supabase
          .from('ifood_tokens')
          .select('access_token')
          .eq('user_id', userId)
          .single();

        if (tokenError || !tokenData?.access_token) {
          console.error('❌ [TOKEN FAILURE] Token não encontrado para user_id:', userId);
          return {
            success: false,
            error: 'Token de acesso não encontrado. Faça login no iFood primeiro.'
          };
        }
        token = tokenData.access_token;
        console.log('✅ [STEP 1] Token obtido do banco com sucesso');
      }

      // 2. Buscar catalog_id via API do iFood
      console.log('🔍 [STEP 2] Buscando catalog_id do merchant...');
      const catalogsUrl = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/catalogs`;
      
      let catalogId: string;
      try {
        const catalogsResponse = await axios.get(catalogsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const catalogsData = catalogsResponse.data;
        if (!catalogsData || !Array.isArray(catalogsData) || catalogsData.length === 0) {
          return {
            success: false,
            error: 'Nenhum catálogo encontrado para este merchant'
          };
        }

        catalogId = catalogsData[0].catalogId || catalogsData[0].id;
        console.log(`✅ [STEP 2] Catalog ID encontrado: ${catalogId}`);
      } catch (error: any) {
        console.error('❌ [STEP 2] Erro ao buscar catálogo:', error.response?.data || error.message);
        return {
          success: false,
          error: 'Erro ao buscar catálogo do merchant'
        };
      }

      // 3. Buscar TODAS as categorias da API do iFood
      console.log('📂 [STEP 3] Buscando todas as categorias do catálogo...');
      const categoriesUrl = `${this.IFOOD_API_BASE_URL}/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories`;
      
      let allCategories: any[] = [];
      try {
        const categoriesResponse = await axios.get(categoriesUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        allCategories = categoriesResponse.data || [];
        console.log(`✅ [STEP 3] ${allCategories.length} categorias encontradas na API do iFood`);
      } catch (error: any) {
        console.error('❌ [STEP 3] Erro ao buscar categorias:', error.response?.data || error.message);
        return {
          success: false,
          error: 'Erro ao buscar categorias da API do iFood'
        };
      }

      // 4. Sincronizar categorias no banco de dados
      console.log('💾 [STEP 4] Sincronizando categorias no banco de dados...');
      let newCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const apiCategory of allCategories) {
        try {
          // Verificar se categoria já existe no banco
          const { data: existingCategory } = await this.supabase
            .from('ifood_categories')
            .select('id, name, status')
            .eq('ifood_category_id', apiCategory.id)
            .eq('merchant_id', merchantId)
            .single();

          if (existingCategory) {
            // Atualizar categoria existente se houver mudanças
            if (existingCategory.name !== apiCategory.name || existingCategory.status !== apiCategory.status) {
              await this.supabase
                .from('ifood_categories')
                .update({
                  name: apiCategory.name,
                  status: apiCategory.status,
                  index: apiCategory.index || 0,
                  template: apiCategory.template || 'DEFAULT',
                  sequence_number: apiCategory.sequence || apiCategory.index || 0,
                  external_code: apiCategory.externalCode,
                  updated_at: new Date().toISOString()
                })
                .eq('ifood_category_id', apiCategory.id)
                .eq('merchant_id', merchantId);

              updatedCount++;
              console.log(`🔄 [STEP 4] Categoria atualizada: ${apiCategory.name}`);
            } else {
              skippedCount++;
              console.log(`⏭️ [STEP 4] Categoria inalterada: ${apiCategory.name}`);
            }
          } else {
            // Criar nova categoria no banco
            const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await this.supabase
              .from('ifood_categories')
              .insert({
                category_id: categoryId,
                ifood_category_id: apiCategory.id,
                merchant_id: merchantId,
                catalog_id: catalogId,
                name: apiCategory.name,
                external_code: apiCategory.externalCode,
                status: apiCategory.status || 'AVAILABLE',
                index: apiCategory.index || 0,
                template: apiCategory.template || 'DEFAULT',
                sequence_number: apiCategory.sequence || apiCategory.index || 0,
                user_id: userId,
                created_at: new Date().toISOString()
              });

            newCount++;
            console.log(`➕ [STEP 4] Nova categoria adicionada: ${apiCategory.name}`);
          }
        } catch (error: any) {
          console.error(`❌ [STEP 4] Erro ao processar categoria ${apiCategory.name}:`, error);
          continue;
        }
      }

      console.log(`✅ [SYNC CATEGORIES] Sincronização concluída:`);
      console.log(`  📊 Total na API: ${allCategories.length}`);
      console.log(`  ➕ Novas: ${newCount}`);
      console.log(`  🔄 Atualizadas: ${updatedCount}`);
      console.log(`  ⏭️ Inalteradas: ${skippedCount}`);

      return {
        success: true,
        data: {
          total: allCategories.length,
          new: newCount,
          updated: updatedCount,
          skipped: skippedCount,
          merchant_id: merchantId,
          catalog_id: catalogId
        }
      };

    } catch (error: any) {
      console.error('❌ [SYNC CATEGORIES] Erro geral:', error);
      return {
        success: false,
        error: error.message || 'Erro interno ao sincronizar categorias'
      };
    }
  }

}