import { useState, useEffect, useCallback } from 'react';
import { IfoodMerchantsService, StatusChangeNotification } from '@/utils/ifoodMerchantsService';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

export interface StatusMonitoringResult {
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
  lastUpdate: string;
}

export const useStatusMonitoring = (userId: string) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringData, setMonitoringData] = useState<StatusMonitoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Função para verificar status manual
  const checkStatus = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('🔍 [useStatusMonitoring] Verificando status manual...');
      const result = await IfoodMerchantsService.checkMerchantsStatus(userId);
      
      if (result.success) {
        setMonitoringData({
          merchants: result.merchants,
          summary: result.summary,
          lastUpdate: new Date().toISOString()
        });
        logger.debug('✅ [useStatusMonitoring] Status verificado:', result.summary);
      } else {
        setError(result.error || 'Erro ao verificar status');
        console.error('❌ [useStatusMonitoring] Erro:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ [useStatusMonitoring] Erro ao verificar status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Função para iniciar monitoramento automático
  const startMonitoring = useCallback(() => {
    if (!userId) {
      setError('ID do usuário não fornecido');
      return;
    }

    logger.debug('🚀 [useStatusMonitoring] Iniciando monitoramento automático...');
    
    const result = IfoodMerchantsService.startAutomaticMonitoring(userId, 5);
    
    if (result.success) {
      setIsMonitoring(true);
      setError(null);
      logger.debug('✅ [useStatusMonitoring] Monitoramento iniciado');
      
      // Verificar status inicial
      checkStatus();
    } else {
      setError(result.message);
      console.error('❌ [useStatusMonitoring] Erro ao iniciar:', result.message);
    }
  }, [userId, checkStatus]);

  // Função para parar monitoramento automático
  const stopMonitoring = useCallback(() => {
    logger.debug('🛑 [useStatusMonitoring] Parando monitoramento automático...');
    
    const result = IfoodMerchantsService.stopAutomaticMonitoring();
    
    if (result.success) {
      setIsMonitoring(false);
      setError(null);
      logger.debug('✅ [useStatusMonitoring] Monitoramento parado');
    } else {
      setError(result.message);
      console.error('❌ [useStatusMonitoring] Erro ao parar:', result.message);
    }
  }, []);

  // Verificar se monitoramento está ativo ao montar componente
  useEffect(() => {
    const isActive = IfoodMerchantsService.isMonitoringActive();
    setIsMonitoring(isActive);
    
    if (isActive) {
      logger.debug('📊 [useStatusMonitoring] Monitoramento já está ativo');
      // Fazer uma verificação inicial se monitoramento já estiver rodando
      checkStatus();
    }
  }, [checkStatus]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      // Não parar automaticamente o monitoramento ao desmontar
      // pois pode estar sendo usado em outros componentes
      logger.debug('🧹 [useStatusMonitoring] Hook desmontado');
    };
  }, []);

  // Configurar callback de notificações
  useEffect(() => {
    const unsubscribe = IfoodMerchantsService.onStatusChange((notification) => {
      logger.debug('🔔 [useStatusMonitoring] Notificação recebida:', notification);
      
      const statusText = notification.newStatus ? 'DISPONÍVEL' : 'INDISPONÍVEL';
      const previousStatusText = notification.previousStatus ? 'DISPONÍVEL' : 'INDISPONÍVEL';
      
      // Mostrar toast de notificação
      toast({
        title: '🔔 Status Alterado',
        description: `${notification.merchantName}: ${previousStatusText} → ${statusText}`,
        duration: 8000,
        className: notification.newStatus 
          ? 'border-green-200 bg-green-50' 
          : 'border-red-200 bg-red-50'
      });
      
      // Atualizar dados locais se necessário
      if (monitoringData) {
        setMonitoringData(prev => {
          if (!prev) return prev;
          
          const updatedMerchants = prev.merchants.map(merchant => 
            merchant.merchant_id === notification.merchantId
              ? { ...merchant, status: notification.newStatus, statusChanged: true }
              : merchant
          );
          
          const newSummary = {
            total: updatedMerchants.length,
            available: updatedMerchants.filter(m => m.status === true).length,
            unavailable: updatedMerchants.filter(m => m.status === false).length,
            changed: updatedMerchants.filter(m => m.statusChanged).length
          };
          
          return {
            ...prev,
            merchants: updatedMerchants,
            summary: newSummary
          };
        });
      }
    });
    
    return unsubscribe;
  }, [monitoringData]);

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = useCallback(async () => {
    const permission = await IfoodMerchantsService.requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      toast({
        title: '🔔 Notificações Ativadas',
        description: 'Você receberá notificações quando o status das lojas mudar.',
        duration: 4000,
        className: 'border-green-200 bg-green-50'
      });
    } else if (permission === 'denied') {
      toast({
        title: '📵 Notificações Negadas',
        description: 'As notificações do navegador foram negadas. Você ainda receberá alertas na interface.',
        duration: 6000,
        className: 'border-yellow-200 bg-yellow-50'
      });
    }
    
    return permission;
  }, []);

  // Verificar permissão atual ao montar
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  return {
    // Estado
    isMonitoring,
    monitoringData,
    isLoading,
    error,
    notificationPermission,
    
    // Ações
    startMonitoring,
    stopMonitoring,
    checkStatus,
    requestNotificationPermission,
    
    // Dados derivados
    hasData: !!monitoringData,
    lastUpdate: monitoringData?.lastUpdate,
    summary: monitoringData?.summary || { total: 0, available: 0, unavailable: 0, changed: 0 },
    
    // Status de notificações
    canNotify: notificationPermission === 'granted',
    notificationsBlocked: notificationPermission === 'denied',
    notificationsAvailable: 'Notification' in window
  };
};