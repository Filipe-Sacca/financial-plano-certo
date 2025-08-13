import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/App';
import { useIfoodSyncStatus } from '@/hooks/useIfoodSyncStatus';

interface DynamicIntegrationStatusProps {
  onTokenGenerated?: () => void;
}

const DynamicIntegrationStatus = ({ onTokenGenerated }: DynamicIntegrationStatusProps) => {
  const { user } = useAuth();
  const { status, loading, refreshStatus } = useIfoodSyncStatus();
  const { toast } = useToast();
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);

  const handleSyncProducts = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncingProducts(true);
    
    try {
      console.log('🛍️ Iniciando sincronização de produtos...');
      
      const response = await fetch('http://localhost:8081/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '✅ Produtos sincronizados!',
          description: `${result.total_products || 0} produtos sincronizados. ${result.new_products || 0} novos, ${result.updated_products || 0} atualizados.`,
        });
        
        // Atualizar status das integrações
        setTimeout(() => {
          refreshStatus();
        }, 1000);
      } else {
        throw new Error(result.error || 'Erro na sincronização');
      }
      
    } catch (error: any) {
      console.error('❌ Erro na sincronização de produtos:', error);
      toast({
        title: 'Erro na sincronização',
        description: error.message || 'Erro ao sincronizar produtos do iFood',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingProducts(false);
    }
  };

  const getStatusIcon = (apiStatus: string) => {
    switch (apiStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <CheckCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (apiStatus: string) => {
    switch (apiStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">Desconectado</Badge>;
    }
  };

  const getStatusColor = (apiStatus: string) => {
    switch (apiStatus) {
      case 'connected':
        return 'bg-green-100';
      case 'partial':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Verificando status das integrações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com botão de atualizar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">
            Status atualizado automaticamente baseado em dados reais
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={refreshStatus}
          disabled={loading}
          className="flex items-center space-x-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Atualizar Status</span>
        </Button>
      </div>

      {status.map((api) => (
        <Card key={api.name}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className={`p-2 ${getStatusColor(api.status)} rounded-lg`}>
                {getStatusIcon(api.status)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{api.name}</h3>
                <p className="text-sm text-gray-600">{api.description}</p>
                {api.lastSync && (
                  <p className="text-xs text-gray-500 mt-1">
                    Última sincronização: {api.lastSync}
                  </p>
                )}
                {api.count !== undefined && api.count > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {api.count} item{api.count !== 1 ? 's' : ''} sincronizado{api.count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {api.name === 'Catalog API' && api.status === 'disconnected' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSyncProducts}
                  disabled={isSyncingProducts}
                  className="flex items-center space-x-1"
                >
                  {isSyncingProducts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  <span>Sincronizar Produtos</span>
                </Button>
              )}
              {getStatusBadge(api.status)}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Sistema de Status Dinâmico</h4>
            <p className="text-sm text-blue-700 mt-1">
              Os status acima são atualizados automaticamente baseado nos dados realmente sincronizados. 
              Uma API só aparece como "Conectado" quando há dados válidos no sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicIntegrationStatus;