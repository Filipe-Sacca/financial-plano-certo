
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  Star,
  Users
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import RevenueChart from '@/components/charts/RevenueChart';
import OrdersChart from '@/components/charts/OrdersChart';
import { IntegrationStatusCard } from '@/components/IntegrationStatusCard';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useClients } from '@/hooks/useClients';
import { FilterBar } from '@/components/ui/filter-bar';
import { useMemo, useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface DashboardProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: { start: string; end: string };
}

export const Dashboard = ({ selectedClient, selectedPeriod, dateRange }: DashboardProps) => {
  const { data: clients } = useClients();
  
  // Estados locais para os filtros do dashboard
  const [localSelectedClient, setLocalSelectedClient] = useState(selectedClient || 'all');
  const [localSelectedPeriod, setLocalSelectedPeriod] = useState(selectedPeriod || '30d');
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>();

  // Calcular range de datas local se não vier como prop
  const calculatedDateRange = useMemo(() => {
    if (localSelectedPeriod === 'custom' && localDateRange) {
      return {
        start: format(localDateRange.from!, 'yyyy-MM-dd'),
        end: format(localDateRange.to || localDateRange.from!, 'yyyy-MM-dd')
      };
    }

    if (dateRange) return dateRange;

    const today = new Date();
    let startDate: Date;

    switch (localSelectedPeriod) {
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
  }, [localSelectedPeriod, localDateRange, dateRange]);

  const { data: financialMetrics } = useFinancialMetrics(
    localSelectedClient === 'all' ? undefined : localSelectedClient, 
    calculatedDateRange
  );

  // Calcular métricas agregadas dos dados reais
  const dashboardData = useMemo(() => {
    if (!financialMetrics || financialMetrics.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageTicket: 0,
        monthlyGrowth: 0,
        recentMetrics: [],
        topPerformingClients: []
      };
    }

    // Filtrar dados baseado no período selecionado ou usar últimos 30 dias por padrão
    const filteredData = selectedPeriod ? 
      financialMetrics : 
      financialMetrics.filter(metric => {
        const metricDate = parseISO(metric.date);
        const thirtyDaysAgo = subDays(new Date(), 30);
        return metricDate >= thirtyDaysAgo;
      });

    const last30Days = filteredData;

    const totalRevenue = last30Days.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const totalOrders = last30Days.reduce((sum, metric) => sum + (metric.orders_count || 0), 0);
    
    // Agrupar por cliente para top performers
    const clientMetrics = new Map();
    last30Days.forEach(metric => {
      const clientName = (metric as any).clients?.name || 'Cliente';
      if (!clientMetrics.has(clientName)) {
        clientMetrics.set(clientName, { revenue: 0, orders: 0 });
      }
      const current = clientMetrics.get(clientName);
      current.revenue += metric.revenue || 0;
      current.orders += metric.orders_count || 0;
    });

    const topPerformingClients = Array.from(clientMetrics.entries())
      .map(([name, data]: [string, any]) => ({
        name,
        revenue: data.revenue,
        orders: data.orders,
        averageTicket: data.orders > 0 ? data.revenue / data.orders : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      averageTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      monthlyGrowth: Math.random() * 20 - 10, // Temporário até implementar cálculo real
      recentMetrics: last30Days.slice(0, 10),
      topPerformingClients
    };
  }, [financialMetrics]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho dos seus restaurantes
        </p>
      </div>

      {/* Filtros Locais */}
      <FilterBar
        selectedClient={localSelectedClient}
        onClientChange={setLocalSelectedClient}
        selectedPeriod={localSelectedPeriod}
        onPeriodChange={setLocalSelectedPeriod}
        dateRange={localDateRange}
        onDateRangeChange={setLocalDateRange}
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Faturamento Total"
          value={`R$ ${dashboardData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={`${dashboardData.monthlyGrowth >= 0 ? '+' : ''}${dashboardData.monthlyGrowth.toFixed(1)}%`}
          trend={dashboardData.monthlyGrowth >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          color="text-green-600"
        />
        <KPICard
          title="Total de Pedidos"
          value={dashboardData.totalOrders.toLocaleString('pt-BR')}
          change="+12%"
          trend="up"
          icon={ShoppingCart}
          color="text-blue-600"
        />
        <KPICard
          title="Ticket Médio"
          value={`R$ ${dashboardData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change="+5.2%"
          trend="up"
          icon={TrendingUp}
          color="text-purple-600"
        />
        <KPICard
          title="Clientes Ativos"
          value={clients?.length.toString() || '0'}
          change="+2"
          trend="up"
          icon={Users}
          color="text-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={dashboardData.recentMetrics} />
        <OrdersChart data={dashboardData.recentMetrics} />
      </div>

      {/* Status das Integrações */}
      <div className="grid gap-6 md:grid-cols-2">
        <IntegrationStatusCard />
        <Card>
          <CardHeader>
            <CardTitle>Configuração Rápida</CardTitle>
            <CardDescription>
              Configure suas integrações para começar a usar todos os recursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">iF</span>
                  </div>
                  <div>
                    <h4 className="font-medium">iFood API</h4>
                    <p className="text-sm text-gray-600">Sincronize dados dos restaurantes</p>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Configurar →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Clients */}
      {dashboardData.topPerformingClients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes (Últimos 30 dias)</CardTitle>
            <CardDescription>
              Clientes com melhor desempenho em faturamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.topPerformingClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.orders} pedidos • Ticket médio: R$ {client.averageTicket.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      R$ {client.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados insuficientes */}
      {(!financialMetrics || financialMetrics.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">Bem-vindo ao seu Dashboard!</h3>
              <p className="text-muted-foreground mb-6">
                Para começar a ver dados reais aqui, você pode:
              </p>
              <div className="space-y-2 text-left">
                <p>• Fazer upload de planilhas Excel com dados financeiros</p>
                <p>• Configurar a integração com a API do iFood</p>
                <p>• Cadastrar clientes e inserir dados manualmente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
