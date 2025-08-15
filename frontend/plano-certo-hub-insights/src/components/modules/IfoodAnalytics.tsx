import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useClients } from '@/hooks/useClients';
import { FilterBar } from '@/components/ui/filter-bar';
import { useMemo, useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRange } from 'react-day-picker';

interface IfoodAnalyticsProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: { start: string; end: string };
}

export const IfoodAnalytics = ({ selectedClient, selectedPeriod, dateRange }: IfoodAnalyticsProps) => {
  const { data: clients } = useClients();
  
  // Estados locais para os filtros
  const [localSelectedClient, setLocalSelectedClient] = useState(selectedClient || 'all');
  const [localSelectedPeriod, setLocalSelectedPeriod] = useState(selectedPeriod || '30d');
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>();

  // Calcular range de datas local
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

  const analyticsData = useMemo(() => {
    if (!financialMetrics || financialMetrics.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgTicket: 0,
        totalCommission: 0,
        netRevenue: 0,
        commissionRate: 0,
        dailyBreakdown: [],
        weeklyComparison: { current: 0, previous: 0, growth: 0 }
      };
    }

    // Filtrar apenas dados do iFood
    const ifoodData = financialMetrics.filter(metric => metric.source === 'ifood');
    
    const last30Days = ifoodData.filter(metric => {
      const metricDate = parseISO(metric.date);
      const thirtyDaysAgo = subDays(new Date(), 30);
      return metricDate >= thirtyDaysAgo;
    });

    const totalRevenue = last30Days.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const totalOrders = last30Days.reduce((sum, metric) => sum + (metric.orders_count || 0), 0);
    const totalCommission = last30Days.reduce((sum, metric) => sum + (metric.commission || 0), 0);
    const netRevenue = last30Days.reduce((sum, metric) => sum + (metric.net_revenue || 0), 0);

    // Análise semanal
    const currentWeek = last30Days.filter(metric => {
      const metricDate = parseISO(metric.date);
      const sevenDaysAgo = subDays(new Date(), 7);
      return metricDate >= sevenDaysAgo;
    });

    const previousWeek = last30Days.filter(metric => {
      const metricDate = parseISO(metric.date);
      const fourteenDaysAgo = subDays(new Date(), 14);
      const sevenDaysAgo = subDays(new Date(), 7);
      return metricDate >= fourteenDaysAgo && metricDate < sevenDaysAgo;
    });

    const currentWeekRevenue = currentWeek.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const previousWeekRevenue = previousWeek.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const weeklyGrowth = previousWeekRevenue > 0 ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 : 0;

    // Breakdown diário dos últimos 7 dias
    const dailyBreakdown = currentWeek.map(metric => ({
      date: format(parseISO(metric.date), 'dd/MM', { locale: ptBR }),
      revenue: metric.revenue || 0,
      orders: metric.orders_count || 0,
      avgTicket: (metric.orders_count || 0) > 0 ? (metric.revenue || 0) / (metric.orders_count || 0) : 0,
      commission: metric.commission || 0,
      netRevenue: metric.net_revenue || 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalRevenue,
      totalOrders,
      avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalCommission,
      netRevenue,
      commissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
      dailyBreakdown,
      weeklyComparison: {
        current: currentWeekRevenue,
        previous: previousWeekRevenue,
        growth: weeklyGrowth
      }
    };
  }, [financialMetrics]);

  if (!financialMetrics || financialMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">Nenhum dado do iFood encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Faça o upload de dados do iFood para ver a análise detalhada aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análise iFood</h1>
        <p className="text-muted-foreground">
          Análise detalhada dos dados importados do iFood
        </p>
      </div>

      {/* Filtros */}
      <FilterBar
        selectedClient={localSelectedClient}
        onClientChange={setLocalSelectedClient}
        selectedPeriod={localSelectedPeriod}
        onPeriodChange={setLocalSelectedPeriod}
        dateRange={localDateRange}
        onDateRangeChange={setLocalDateRange}
      />

      {/* KPIs principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento (30 dias)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {analyticsData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {analyticsData.weeklyComparison.growth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.weeklyComparison.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.weeklyComparison.growth.toFixed(1)}% vs semana anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {analyticsData.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Comissão</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.commissionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {analyticsData.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em comissões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Receita Líquida */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Faturamento Bruto</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {analyticsData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Comissões e Taxas</p>
              <p className="text-2xl font-bold text-red-600">
                -R$ {analyticsData.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Receita Líquida</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {analyticsData.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance diária */}
      {analyticsData.dailyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Diária</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>Ticket Médio</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.dailyBreakdown.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell>{day.orders}</TableCell>
                    <TableCell>R$ {day.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>R$ {day.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-red-600">R$ {day.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-green-600 font-medium">R$ {day.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
