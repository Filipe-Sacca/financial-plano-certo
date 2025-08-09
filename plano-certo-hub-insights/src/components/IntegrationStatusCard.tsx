import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, Settings, RefreshCw } from 'lucide-react';
import { useIntegrationCheck } from '@/hooks/useIntegrationCheck';
import { useAuth } from '@/App';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { validateIfoodToken, getTokenStatusDescription } from '@/utils/tokenValidation';

interface IntegrationStatusCardProps {
  onConfigureClick?: () => void;
}

export const IntegrationStatusCard = ({ onConfigureClick }: IntegrationStatusCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: integrationStatus, isLoading, refetch } = useIntegrationCheck(user?.id);

  const handleRefresh = async () => {
    console.log('🔄 [IntegrationStatusCard] Forçando atualização do status...');
    toast.info('🔄 Atualizando status das integrações...');
    
    try {
      // Invalidar cache e forçar nova busca
      await queryClient.invalidateQueries({ queryKey: ['integration_check', user?.id] });
      await refetch();
      toast.success('✅ Status das integrações atualizado!');
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast.error('❌ Erro ao atualizar status das integrações');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Status das Integrações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Verificando integrações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIfoodStatus = () => {
    if (!integrationStatus?.hasIfoodIntegration) {
      return {
        status: 'disconnected',
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        title: 'iFood - Desconectado',
        description: 'Configure a integração para sincronizar dados',
        badge: <Badge variant="destructive">Desconectado</Badge>
      };
    }

    const token = integrationStatus.ifoodToken;
    
    // Usar a função utilitária para validação robusta
    const validation = validateIfoodToken(token || {}, 'IntegrationStatusCard');
    const description = getTokenStatusDescription(validation);

    // Se token está expirado
    if (!validation.isValid && validation.isExpired) {
      return {
        status: 'expired',
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        title: 'iFood - Token Expirado',
        description,
        badge: <Badge variant="destructive">Expirado</Badge>
      };
    }

    // Token válido
    return {
      status: 'connected',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'iFood - Conectado',
      description,
      badge: <Badge variant="default" className="bg-green-100 text-green-800">Conectado</Badge>
    };
  };

  const ifoodStatus = getIfoodStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Status das Integrações</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
            {onConfigureClick && (
              <Button variant="outline" size="sm" onClick={onConfigureClick}>
                Configurar
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status iFood */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {ifoodStatus.icon}
            <div>
              <h4 className="font-medium text-gray-900">{ifoodStatus.title}</h4>
              <p className="text-sm text-gray-600">{ifoodStatus.description}</p>
            </div>
          </div>
          {ifoodStatus.badge}
        </div>

        {/* Resumo */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Integrações ativas:</span>
            <span className="font-medium">
              {integrationStatus?.hasIfoodIntegration ? '1 de 1' : '0 de 1'}
            </span>
          </div>
          {integrationStatus?.lastChecked && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Última verificação:</span>
              <span>{new Date(integrationStatus.lastChecked).toLocaleTimeString('pt-BR')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 