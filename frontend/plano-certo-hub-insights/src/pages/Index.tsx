import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';

// Financial components
import { FinancialDashboard } from '@/components/financial/FinancialDashboard';
import { SettlementsPanel } from '@/components/financial/SettlementsPanel';
import { EventsPanel } from '@/components/financial/EventsPanel';
import { SalesPanel } from '@/components/financial/SalesPanel';
import { ReconciliationPanel } from '@/components/financial/ReconciliationPanel';
import { AnticipationsPanel } from '@/components/financial/AnticipationsPanel';

// iFood components
import { IfoodApiConfig } from '@/components/modules/IfoodApiConfig';
import OpeningHoursManager from '@/components/modules/merchants/OpeningHoursManager';

export default function Index() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeModule, setActiveModule] = useState('financial-dashboard');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Calculate date range based on selected period
  const dateRangeFilter = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return {
        start: format(dateRange.from, 'yyyy-MM-dd'),
        end: format(dateRange.to, 'yyyy-MM-dd')
      };
    }

    const today = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '7d':
        startDate = subDays(today, 7);
        break;
      case '15d':
        startDate = subDays(today, 15);
        break;
      case '30d':
        startDate = subDays(today, 30);
        break;
      case '60d':
        startDate = subDays(today, 60);
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
    // Mock merchantId for now - should come from user context
    const merchantId = user?.id || 'default-merchant';

    switch (activeModule) {
      case 'financial-dashboard':
        return <FinancialDashboard />;
      case 'settlements':
        return (
          <div className="container mx-auto p-6 mt-8">
            <SettlementsPanel merchantId={merchantId} />
          </div>
        );
      case 'events':
        return (
          <div className="container mx-auto p-6 mt-8">
            <EventsPanel merchantId={merchantId} />
          </div>
        );
      case 'sales':
        return (
          <div className="container mx-auto p-6 mt-8">
            <SalesPanel merchantId={merchantId} />
          </div>
        );
      case 'reconciliation':
        return (
          <div className="container mx-auto p-6 mt-8">
            <ReconciliationPanel merchantId={merchantId} />
          </div>
        );
      case 'anticipations':
        return (
          <div className="container mx-auto p-6 mt-8">
            <AnticipationsPanel merchantId={merchantId} />
          </div>
        );
      case 'ifood-sync':
        return (
          <div className="container mx-auto p-6 mt-8">
            <IfoodApiConfig />
          </div>
        );
      case 'opening-hours':
        return (
          <div className="container mx-auto p-6 mt-8">
            <OpeningHoursManager />
          </div>
        );
      default:
        return <FinancialDashboard />;
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