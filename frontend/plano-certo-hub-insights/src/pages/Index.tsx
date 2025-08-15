
import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { ClientManagement } from '@/components/modules/ClientManagement';
import { ExcelUploadModule } from '@/components/modules/ExcelUploadModule';
import { MenuOptimization } from '@/components/modules/MenuOptimization';
import { MenuManagement } from '@/components/modules/MenuManagement';
import { IfoodApiConfig } from '@/components/modules/IfoodApiConfig';
import { StoreMonitoring } from '@/components/modules/StoreMonitoring';
import { DiagnosticModule } from '@/components/modules/DiagnosticModule';
import { AutomationModule } from '@/components/modules/AutomationModule';
import { AssistantModule } from '@/components/modules/AssistantModule';
import { SupportModule } from '@/components/modules/SupportModule';
import { ReportsModule } from '@/components/modules/ReportsModule';
import { IfoodAnalytics } from '@/components/modules/IfoodAnalytics';
import IfoodAdvancedAnalytics from '@/components/modules/IfoodAdvancedAnalytics';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/App';
import { useIntegrationCheck } from '@/hooks/useIntegrationCheck';
import { toast } from '@/components/ui/use-toast';

export default function Index() {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Verificar integrações ativas do usuário
  const { data: integrationStatus, isLoading: isCheckingIntegration } = useIntegrationCheck(user?.id);

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
    const commonProps = {
      selectedClient: selectedClient === 'all' ? undefined : selectedClient,
      selectedPeriod,
      dateRange: calculatedDateRange
    };

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'ifood-analytics':
        return <IfoodAnalytics {...commonProps} />;
      case 'ifood-advanced-analytics':
        return <IfoodAdvancedAnalytics 
          selectedClient={selectedClient === 'all' ? undefined : selectedClient}
          selectedPeriod={selectedPeriod}
          dateRange={dateRange}
        />;
      case 'clients':
        return <ClientManagement />;
      case 'excel-upload':
        return <ExcelUploadModule />;
      case 'menu-optimization':
        return <MenuOptimization {...commonProps} />;
      case 'menu-management':
        return <MenuManagement />;
      case 'ifood-api':
        return <IfoodApiConfig />;
      case 'store-monitoring':
        return <StoreMonitoring />;
      case 'diagnostics':
        return <DiagnosticModule />;
      case 'automation':
        return <AutomationModule />;
      case 'assistant':
        return <AssistantModule />;
      case 'support':
        return <SupportModule />;
      case 'reports':
        return <ReportsModule {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
