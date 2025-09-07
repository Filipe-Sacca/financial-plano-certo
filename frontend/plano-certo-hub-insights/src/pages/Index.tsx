
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MenuManagement } from '@/components/modules/MenuManagement';
import { IfoodApiConfig } from '@/components/modules/IfoodApiConfig';
import IfoodOrdersManager from '@/components/modules/IfoodOrdersManager';
import IfoodReviewsManager from '@/components/modules/IfoodReviewsManager';
import { IfoodShippingManager } from '@/components/modules/IfoodShippingManager';
import { StoreMonitoring } from '@/components/modules/StoreMonitoring';
import OpeningHoursManager from '@/components/modules/OpeningHoursManager';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/App';
import { useIntegrationCheck } from '@/hooks/useIntegrationCheck';
import { toast } from '@/components/ui/use-toast';

export default function Index() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeModule, setActiveModule] = useState('menu-management');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [highlightOrder, setHighlightOrder] = useState<string | null>(null);
  
  // Verificar integrações ativas do usuário
  const { data: integrationStatus, isLoading: isCheckingIntegration } = useIntegrationCheck(user?.id);

  // Handle navigation from Orders to Shipping
  useEffect(() => {
    if (location.state?.activeModule === 'shipping') {
      setActiveModule('ifood-shipping');
      if (location.state?.highlightOrder) {
        setHighlightOrder(location.state.highlightOrder);
      }
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Mostrar notificações sobre o status das integrações
  useEffect(() => {
    if (integrationStatus && !isCheckingIntegration) {
      if (integrationStatus.hasIfoodIntegration) {
        // Verificar se o token não expirou
        if (integrationStatus.ifoodToken?.expires_at) {
          toast({
            title: '✅ Integração iFood ativa',
            description: 'Sua integração com o iFood está funcionando normalmente.',
          });
        } else {
          toast({
            title: '✅ Integração iFood ativa',
            description: 'Sua integração com o iFood está funcionando normalmente.',
          });
        }
      } else {
        toast({
          title: '🔗 Configure suas integrações',
          description: 'Configure a integração com o iFood para aproveitar todos os recursos.',
          variant: 'default',
        });
      }
    }
  }, [integrationStatus, isCheckingIntegration]);

  // Calcular o range de datas baseado no período selecionado
  const calculatedDateRange = useMemo(() => {
    if (selectedPeriod === 'custom' && dateRange) {
      return {
        start: format(dateRange.from!, 'yyyy-MM-dd'),
        end: format(dateRange.to || dateRange.from!, 'yyyy-MM-dd')
      };
    }

    const today = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '1d':
        startDate = today;
        break;
      case '7d':
        startDate = subDays(today, 7);
        break;
      case '30d':
        startDate = subDays(today, 30);
        break;
      case '90d':
        startDate = subDays(today, 90);
        break;
      case '180d':
        startDate = subDays(today, 180);
        break;
      case '365d':
        startDate = subDays(today, 365);
        break;
      default:
        startDate = subDays(today, 30);
    }

    return {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd')
    };
  }, [selectedPeriod, dateRange]);

  const renderModule = () => {
    switch (activeModule) {
      case 'menu-management':
        return <MenuManagement />;
      case 'ifood-api':
        return <IfoodApiConfig />;
      case 'ifood-orders':
        return <IfoodOrdersManager />;
      case 'ifood-reviews':
        return integrationStatus?.ifoodMerchant?.merchant_id && user?.id ? (
          <IfoodReviewsManager 
            merchantId={integrationStatus.ifoodMerchant.merchant_id} 
            userId={user.id} 
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Configure a integração com o iFood para visualizar avaliações</p>
          </div>
        );
      case 'ifood-shipping':
        return integrationStatus?.ifoodMerchant?.merchant_id && user?.id ? (
          <IfoodShippingManager 
            merchantId={integrationStatus.ifoodMerchant.merchant_id}
            highlightOrder={highlightOrder} 
            userId={user.id} 
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Configure a integração com o iFood para gerenciar entregas</p>
          </div>
        );
      case 'store-monitoring':
        return <StoreMonitoring />;
      case 'opening-hours':
        return <OpeningHoursManager />;
      default:
        return <MenuManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => {}}
          isMobile={false}
          selectedClient={selectedClient}
          onClientChange={setSelectedClient}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
