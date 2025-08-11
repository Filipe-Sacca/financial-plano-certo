
import { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Key,
  Store, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Globe,
  Code,
  Database,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useIfoodConfig } from '@/hooks/useIfoodConfig';
import { useIfoodMerchants } from '@/hooks/useIfoodMerchants';
import { IfoodMerchantsService } from '@/utils/ifoodMerchantsService';


interface ApiConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  webhookUrl: string;
}

export const IfoodApiConfig = () => {
  const { user } = useAuth();
  const { data: syncedMerchantsData } = useIfoodMerchants(user?.id);
  const [config, setConfig] = useState<ApiConfig>({
    clientId: '',
    clientSecret: '',
    environment: 'sandbox',
    webhookUrl: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Buscar credenciais do iFood para o usuário logado ao montar (usando user_id)
  useEffect(() => {
    if (user && user.id) {
      console.log('🔍 [DEBUG] Dados do usuário:', {
        id: user.id,
        email: user.email
      });
      console.log('Buscando token do usuário:', user.id);
      
                           import('@/integrations/supabase/client').then(({ supabase }) => {
         console.log('Buscando na tabela ifood_tokens para user_id:', user.id);
        
        // Primeiro, verificar se existe algum token na tabela (sem filtro de user_id)
        supabase
          .from('ifood_tokens')
          .select('user_id, access_token, client_id, expires_at')
          .then(({ data: allTokens, error: allError }) => {
            console.log('🔍 [DEBUG] Todos os tokens na tabela ifood_tokens:', allTokens);
            if (allError) {
              console.error('❌ [DEBUG] Erro ao buscar todos os tokens:', allError);
            }
          });
        
        // Agora buscar o token específico do usuário
         supabase
           .from('ifood_tokens')
           .select('*')
           .eq('user_id', user.id)
           .maybeSingle()
           .then(({ data, error }) => {
            console.log('📊 [DEBUG] Resultado da busca específica:');
            console.log('  - user_id buscado:', user.id);
            console.log('  - dados encontrados:', data);
            console.log('  - erro:', error);
            
             if (error) {
               console.error('Erro na consulta:', error);
             }
                         if (data) {
               console.log('Token encontrado:', {
                 hasAccessToken: !!data.access_token,
                 hasClientId: !!data.client_id,
                 hasClientSecret: !!data.client_secret,
                expiresAt: data.expires_at,
                tokenUserId: data.user_id,
                matchesCurrentUser: data.user_id === user.id
               });
               setConfig({
                 clientId: data.client_id || '',
                 clientSecret: data.client_secret || '',
                 environment: 'sandbox',
                 webhookUrl: ''
               });
               setIsConnected(!!data.access_token && !!data.client_id && !!data.client_secret);
             } else {
              console.log('❌ [DEBUG] Nenhum token encontrado para o usuário:', user.id);
               setIsConnected(false);
             }
          });
      });
    } else {
      console.log('Usuário não está logado ou não possui id.');
    }
  }, [user]);

  const form = useForm<ApiConfig>({
    defaultValues: {
      clientId: '',
      clientSecret: ''
    }
  });

  const handleConnect = async (data: ApiConfig) => {
    setIsConnecting(true);
    try {
      const payload = {
        clientId: String(data.clientId),
        clientSecret: String(data.clientSecret),
        user_id: user?.id // Envia o id do usuário logado
      };
      
      console.log('🚀 [DEBUG] Enviando dados para serviço Node.js local:');
      console.log('  - user_id sendo enviado:', user?.id);
      console.log('  - payload completo:', payload);
      console.log('  - dados do usuário atual:', {
        id: user?.id,
        email: user?.email,
        aud: user?.aud
      });
      
      // Try local Python service first, fallback to N8N webhook
      let response;
      let result;
      
      try {
        // Attempt local Node.js service
        response = await fetch('http://localhost:9000/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        result = await response.json();
        console.log('✅ [DEBUG] Resposta do serviço Node.js local:', result);
      } catch (localError) {
        console.log('⚠️ [DEBUG] Serviço Node.js local indisponível, tentando N8N...');
        // Fallback to N8N webhook
        response = await fetch('https://webhook.n8n.hml.planocertodelivery.com/webhook/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        result = await response.json();
        console.log('✅ [DEBUG] Resposta do webhook N8N:', result);
      }

      // Handle successful response
      if (response.ok && result.success) {
        const tokenData = result.data;
        setConfig({
          clientId: tokenData.client_id || payload.clientId,
          clientSecret: tokenData.client_secret || payload.clientSecret,
          environment: 'sandbox',
          webhookUrl: ''
        });
        setIsConnected(true);
        toast({
          title: '✅ Token gerado com sucesso!',
          description: `Token de acesso iFood criado e armazenado. Expira em ${Math.floor(tokenData.expires_in / 3600)} horas.`
        });
      } else if (response.ok && result.message && result.message.includes('Valid token already exists')) {
        // Token já existe e é válido
        const tokenData = result.data;
        setConfig({
          clientId: tokenData.client_id || payload.clientId,
          clientSecret: tokenData.client_secret || payload.clientSecret,
          environment: 'sandbox',
          webhookUrl: ''
        });
        setIsConnected(true);
        toast({
          title: '✅ Token válido encontrado!',
          description: 'Token de acesso já existe e ainda é válido.'
        });
      } else {
        // Handle N8N legacy response format
        const dataResult = Array.isArray(result) ? result[0] : result;
        if (response.ok && dataResult.clientId && dataResult.clientSecret) {
          setConfig({
            clientId: dataResult.clientId,
            clientSecret: dataResult.clientSecret,
            environment: 'sandbox',
            webhookUrl: ''
          });
          setIsConnected(true);
          toast({
            title: 'Conexão realizada',
            description: 'Conexão realizada com sucesso!'
          });
        } else {
          setIsConnected(false);
          const errorMessage = result.error || dataResult?.error || 'Erro ao gerar token de acesso';
          toast({
            title: 'Erro ao conectar',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      setIsConnected(false);
      console.error('❌ [DEBUG] Erro na conexão:', error);
      toast({
        title: 'Erro ao conectar',
        description: 'Erro ao conectar ao iFood. Verifique suas credenciais.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.id) {
      toast({
        title: '❌ Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('🗑️ Excluindo token do usuário:', user.id);
      
      // Excluir token do banco de dados
      const { error } = await supabase
        .from('ifood_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao excluir token:', error);
        toast({
          title: '❌ Erro',
          description: 'Erro ao desconectar: ' + error.message,
          variant: 'destructive'
        });
        return;
      }

      console.log('✅ Token excluído com sucesso do banco de dados');

      // Limpar estado local
      setConfig({ clientId: '', clientSecret: '', environment: 'sandbox', webhookUrl: '' });
      setIsConnected(false);
      setShowDisconnectModal(false);

      toast({
        title: '✅ Desconectado',
        description: 'Token removido e desconectado com sucesso!',
      });

    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: '❌ Erro',
        description: 'Erro inesperado ao desconectar',
        variant: 'destructive'
      });
    }
  };

// Componente para carregamento de merchants
const MerchantsCard = ({ user }: { user: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSyncMerchants = async () => {
    console.log('🚀 [handleSyncMerchants] Iniciando sincronização de lojas via webhook N8N...');
    console.log('🔍 [handleSyncMerchants] User:', { id: user?.id, email: user?.email });
    
    if (!user?.id) {
      console.error('❌ [handleSyncMerchants] Usuário não autenticado');
      toast({
        title: '❌ Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📡 [handleSyncMerchants] Chamando webhook N8N + buscando dados...');
      
      // Estratégia: POST para N8N webhook + GET da tabela
      const result = await IfoodMerchantsService.syncMerchants(user.id);
      
      if (!result.success) {
        console.error('❌ [handleSyncMerchants] Erro na sincronização:', result.error);
        toast({
          title: '❌ Erro na sincronização',
          description: result.error || 'Erro desconhecido ao sincronizar lojas',
          variant: 'destructive'
        });
        return;
      }

      console.log('✅ [handleSyncMerchants] Sincronização concluída:', result.merchants.length, 'lojas');
      
      // Invalidar queries para atualizar as listas
      queryClient.invalidateQueries({ queryKey: ['ifood-merchants'] });
      
      if (result.merchants.length === 0) {
        toast({
          title: '📭 Nenhuma loja encontrada',
          description: 'Nenhuma loja foi encontrada na sua conta do iFood ou você já possui todas as lojas sincronizadas.'
        });
      } else {
        toast({
          title: '✅ Lojas sincronizadas!',
          description: `${result.merchants.length} lojas sincronizadas via webhook N8N.`
        });
      }
      
    } catch (error) {
      console.error('❌ [handleSyncMerchants] Erro:', error);
      toast({
        title: '❌ Erro',
        description: error instanceof Error ? error.message : 'Erro ao sincronizar lojas',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Lojas iFood
              </p>
              <p className="text-sm text-gray-600">
                Sincronizar lojas via webhook N8N
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSyncMerchants}
            disabled={isLoading}
            className="ml-12 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Carregando...' : 'Carregar Lojas'}</span>
          </Button>
        </div>
        
        {/* Removed client selection */}

        {/* Removed client specific message */}
      </CardContent>
    </Card>
  );
};

// Componente para exibir lojas sincronizadas
const SyncedMerchantsCard = ({ user }: { user: any }) => {
  const { data: syncedMerchants, isLoading, error, refetch } = useIfoodMerchants(user?.id);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: ifoodConfig, refetch: refetchConfig } = useIfoodConfig(user?.id);
  const queryClient = useQueryClient();

  if (!user?.id) {
    return null;
  }

  const handleUpdateMerchants = async () => {
    if (!user?.id) {
      toast({
        title: '❌ Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 [handleUpdateMerchants] Atualizando lista de lojas...');
      console.log('👤 Usuário:', user.id);
      
      // Apenas atualizar a lista buscando dados existentes
      queryClient.invalidateQueries({ queryKey: ['ifood-merchants'] });
      await refetch(); // Força um refetch da lista atual
      
      // Buscar contagem atual para feedback
      const { data: currentMerchants } = await supabase
        .from('ifood_merchants')
        .select('merchant_id')
        .eq('user_id', user.id);
      
      const count = currentMerchants?.length || 0;
      
      console.log('✅ [handleUpdateMerchants] Lista atualizada:', count, 'lojas');
        
        toast({
        title: '✅ Lista Atualizada!',
        description: `${count} lojas carregadas do banco de dados`
      });
      
    } catch (error) {
      console.error('❌ [handleUpdateMerchants] Erro:', error);
      toast({
        title: '❌ Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar lista',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    setIsCleaningDuplicates(true);
    try {
      console.log('🧹 Iniciando limpeza manual de duplicatas...');
      
      const { IfoodMerchantsService } = await import('@/utils/ifoodMerchantsService');
      const result = await IfoodMerchantsService.manualCleanupDuplicates(user.id);
      
      console.log('🧹 Resultado da limpeza:', result);
      
      if (result.success) {
        // Invalidar queries para forçar atualização
        queryClient.invalidateQueries({ queryKey: ['ifood-merchants'] });
        await refetch(); // Forçar refetch imediato
        
        if (result.duplicatesFound === 0) {
          toast({
            title: '✅ Nenhuma Duplicata',
            description: 'Não foram encontradas duplicatas para remover.',
          });
        } else {
        toast({
          title: '🧹 Limpeza Concluída',
            description: `${result.duplicatesFound} duplicatas encontradas, ${result.duplicatesRemoved} removidas`,
        });
        }
      } else {
        console.error('❌ Erro na limpeza:', result.error);
        toast({
          title: '❌ Erro na Limpeza',
          description: result.error || 'Erro ao limpar duplicatas',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Erro ao limpar duplicatas:', error);
      toast({
        title: '❌ Erro',
        description: error instanceof Error ? error.message : 'Erro ao limpar duplicatas',
        variant: 'destructive'
      });
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-green-600" />
            <span>Lojas Sincronizadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupDuplicates}
              disabled={isCleaningDuplicates || isLoading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-3 w-3 ${isCleaningDuplicates ? 'animate-spin' : ''}`} />
              <span>{isCleaningDuplicates ? 'Limpando...' : 'Limpar Duplicados'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateMerchants}
              disabled={isLoading || isCleaningDuplicates || isUpdating}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Carregando...' : 'Recarregar'}</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Carregando lojas...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="ml-2 text-red-600">Erro ao carregar lojas sincronizadas</span>
          </div>
        )}

        {!isLoading && !error && (!syncedMerchants || syncedMerchants.length === 0) && (
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma loja encontrada</p>
              <p className="text-sm text-gray-400">
                Clique em "Carregar Lojas" acima para sincronizar suas lojas do iFood via webhook N8N e visualizá-las aqui.
              </p>
            </div>
          </CardContent>
        )}

        {!isLoading && !error && syncedMerchants && syncedMerchants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <strong>{syncedMerchants.length}</strong> {syncedMerchants.length === 1 ? 'loja encontrada' : 'lojas encontradas'}
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Sincronizado
              </Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {syncedMerchants.map((merchant: any) => (
                <div
                  key={merchant.merchant_id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {merchant.name}
                      </h4>
                      
                      <Badge 
                        variant="outline" 
                        className={
                          merchant.status === 'AVAILABLE' || merchant.status === true
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }
                      >
                        {merchant.status === 'AVAILABLE' || merchant.status === true ? 'Disponível' : 'Status desconhecido'}
                      </Badge>
                    </div>

                    {merchant.corporate_name && merchant.corporate_name !== merchant.name && (
                      <p className="text-xs text-gray-600 mb-1">
                        {merchant.corporate_name}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {merchant.address_city && merchant.address_state && (
                        <span className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span>{merchant.address_city}, {merchant.address_state}</span>
                        </span>
                      )}
                      
                      {merchant.phone && (
                        <span className="flex items-center space-x-1">
                          <span>📞</span>
                          <span>{merchant.phone}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        <span>ID: </span>
                        <code className="bg-gray-100 px-1 rounded text-xs">
                          {merchant.merchant_id.slice(0, 8)}...
                        </code>
                      </div>

                      {merchant.last_sync_at && (
                        <div className="text-xs text-gray-500">
                          Sincronizado: {new Date(merchant.last_sync_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>

                    {merchant.clients && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          Cliente: {merchant.clients.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

  const apiEndpoints = [
    {
      name: 'Authentication',
      description: 'Autenticação OAuth2 com iFood',
      status: isConnected ? 'connected' : 'disconnected',
      endpoint: 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token'
    },
    {
      name: 'Merchant API',
      description: 'Dados dos restaurantes e configurações',
      status: isConnected ? 'connected' : 'disconnected',
      endpoint: 'https://merchant-api.ifood.com.br/merchant/v1.0/'
    },
    {
      name: 'Orders API',
      description: 'Gestão de pedidos em tempo real',
      status: isConnected ? 'connected' : 'disconnected',
      endpoint: 'https://merchant-api.ifood.com.br/order/v1.0/'
    },
    {
      name: 'Catalog API',
      description: 'Gestão do catálogo de produtos',
      status: isConnected ? 'connected' : 'disconnected',
      endpoint: 'https://merchant-api.ifood.com.br/catalog/v1.0/'
    },
    {
      name: 'Financial API',
      description: 'Dados financeiros e faturamento',
      status: isConnected ? 'connected' : 'disconnected',
      endpoint: 'https://merchant-api.ifood.com.br/financial/v1.0/'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuração API iFood
        </h1>
        <p className="text-gray-600">
          Configure suas credenciais de desenvolvedor para integração com o iFood
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isConnected ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Status da Conexão
                    </p>
                    <p className="text-sm text-gray-600">
                      {isConnected ? 'Conectado ao iFood API' : 'Desconectado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                  <button
                    className="ml-2 p-2 rounded-full hover:bg-gray-200 transition"
                    onClick={() => setShowDisconnectModal(true)}
                    title="Configurações da integração"
                  >
                    <Settings className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isConnected && (
            <div className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">4</p>
                      <p className="text-sm text-gray-600">APIs Conectadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="w-full">
                {syncedMerchantsData && syncedMerchantsData.length > 0 ? (
                  <SyncedMerchantsCard user={user} />
                ) : (
                  <MerchantsCard user={user} />
                )}
              </div>
              
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Status das Integrações</h2>
                {[
                  { name: 'iFood Authentication', description: 'Sistema de autenticação do iFood', lastSync: '2 minutos atrás' },
                  { name: 'Merchant API', description: 'Dados dos restaurantes', lastSync: '5 minutos atrás' },
                  { name: 'Orders API', description: 'Pedidos em tempo real', lastSync: '1 minuto atrás' },
                  { name: 'Financial API', description: 'Dados financeiros', lastSync: '2 minutos atrás' }
                ].map((api) => (
                  <Card key={api.name}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{api.name}</h3>
                          <p className="text-sm text-gray-600">{api.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Última sincronização: {api.lastSync}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Desconectar integração do iFood?</DialogTitle>
              </DialogHeader>
              <p>Tem certeza que deseja desconectar? Você precisará inserir as credenciais novamente para reconectar.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDisconnectModal(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Credenciais de API</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="text-xs"
                >
                  <a 
                    href="https://developer.ifood.com.br/pt-BR/docs/guides/authentication/centralized" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Abrir Portal</span>
                  </a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleConnect)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu Client ID do iFood Developer" {...field} />
                        </FormControl>
                        <FormDescription>
                          Client ID fornecido no portal do iFood Developer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Secret</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Seu Client Secret" {...field} />
                        </FormControl>
                        <FormDescription>
                          Client Secret fornecido no portal do iFood Developer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        {isConnected ? 'Atualizar Conexão' : 'Conectar ao iFood'}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints da API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        endpoint.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Database className={`h-5 w-5 ${
                          endpoint.status === 'connected' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{endpoint.name}</h3>
                        <p className="text-sm text-gray-600">{endpoint.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{endpoint.endpoint}</p>
                      </div>
                    </div>
                    <Badge className={
                      endpoint.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }>
                      {endpoint.status === 'connected' ? 'Conectado' : 'Aguardando'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Recursos para Desenvolvedores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Portal do Desenvolvedor</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Acesse o portal oficial do iFood para desenvolvedores
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Portal
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Documentação da API</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Documentação completa da API do iFood
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Documentação
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Ambiente Sandbox</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Teste suas integrações em ambiente seguro
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Sandbox
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Suporte Técnico</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Canal de suporte para desenvolvedores
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contatar Suporte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Para implementar a integração completa com a API do iFood, 
              você precisará configurar funções serverless usando Supabase Edge Functions. 
              Isso garantirá que suas credenciais permaneçam seguras e que você possa processar 
              webhooks e fazer chamadas autenticadas para a API.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

    </div>
  );
};
