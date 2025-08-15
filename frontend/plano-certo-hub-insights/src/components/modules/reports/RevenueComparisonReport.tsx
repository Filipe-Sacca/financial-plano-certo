
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useClients } from '@/hooks/useClients';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevenueComparisonReportProps {
  selectedClient: string;
  dateRange: any;
  onGeneratePDF: (data: any, title: string) => void;
  isGenerating: boolean;
}

export const RevenueComparisonReport = ({ 
  selectedClient, 
  dateRange, 
  onGeneratePDF, 
  isGenerating 
}: RevenueComparisonReportProps) => {
  const { data: financialMetrics } = useFinancialMetrics();
  const { data: clients } = useClients();

  const comparisonData = useMemo(() => {
    if (!financialMetrics || !dateRange?.from || !dateRange?.to) {
      return null;
    }

    const currentPeriodStart = dateRange.from;
    const currentPeriodEnd = dateRange.to;
    const periodDays = differenceInDays(currentPeriodEnd, currentPeriodStart);
    
    // Período anterior (mesmo número de dias)
    const previousPeriodEnd = subDays(currentPeriodStart, 1);
    const previousPeriodStart = subDays(previousPeriodEnd, periodDays);

    // Filtrar dados do período atual
    const currentData = financialMetrics.filter(metric => {
      const metricDate = parseISO(metric.date);
      const matchesClient = !selectedClient || selectedClient === 'all' || metric.client_id === selectedClient;
      return matchesClient && metricDate >= currentPeriodStart && metricDate <= currentPeriodEnd;
    });

    // Filtrar dados do período anterior
    const previousData = financialMetrics.filter(metric => {
      const metricDate = parseISO(metric.date);
      const matchesClient = !selectedClient || selectedClient === 'all' || metric.client_id === selectedClient;
      return matchesClient && metricDate >= previousPeriodStart && metricDate <= previousPeriodEnd;
    });

    // Calcular métricas
    const currentMetrics = {
      revenue: currentData.reduce((sum, m) => sum + (m.revenue || 0), 0),
      orders: currentData.reduce((sum, m) => sum + (m.orders_count || 0), 0),
      averageTicket: 0
    };
    currentMetrics.averageTicket = currentMetrics.orders > 0 ? currentMetrics.revenue / currentMetrics.orders : 0;

    const previousMetrics = {
      revenue: previousData.reduce((sum, m) => sum + (m.revenue || 0), 0),
      orders: previousData.reduce((sum, m) => sum + (m.orders_count || 0), 0),
      averageTicket: 0
    };
    previousMetrics.averageTicket = previousMetrics.orders > 0 ? previousMetrics.revenue / previousMetrics.orders : 0;

    // Calcular variações
    const revenueChange = previousMetrics.revenue > 0 
      ? ((currentMetrics.revenue - previousMetrics.revenue) / previousMetrics.revenue) * 100 
      : 0;
    
    const ordersChange = previousMetrics.orders > 0 
      ? ((currentMetrics.orders - previousMetrics.orders) / previousMetrics.orders) * 100 
      : 0;
    
    const ticketChange = previousMetrics.averageTicket > 0 
      ? ((currentMetrics.averageTicket - previousMetrics.averageTicket) / previousMetrics.averageTicket) * 100 
      : 0;

    // Dados para gráfico diário
    const dailyComparison = [];
    for (let i = 0; i < periodDays; i++) {
      const currentDate = new Date(currentPeriodStart);
      currentDate.setDate(currentDate.getDate() + i);
      
      const previousDate = new Date(previousPeriodStart);
      previousDate.setDate(previousDate.getDate() + i);

      const currentDayData = currentData.find(m => 
        format(parseISO(m.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );
      
      const previousDayData = previousData.find(m => 
        format(parseISO(m.date), 'yyyy-MM-dd') === format(previousDate, 'yyyy-MM-dd')
      );

      dailyComparison.push({
        day: format(currentDate, 'dd/MM'),
        currentRevenue: currentDayData?.revenue || 0,
        previousRevenue: previousDayData?.revenue || 0,
        currentOrders: currentDayData?.orders_count || 0,
        previousOrders: previousDayData?.orders_count || 0
      });
    }

    return {
      current: currentMetrics,
      previous: previousMetrics,
      changes: {
        revenue: revenueChange,
        orders: ordersChange,
        ticket: ticketChange
      },
      dailyComparison,
      periods: {
        current: { start: currentPeriodStart, end: currentPeriodEnd },
        previous: { start: previousPeriodStart, end: previousPeriodEnd }
      }
    };
  }, [financialMetrics, selectedClient, dateRange]);

  const handleGenerateReport = () => {
    if (!comparisonData) return;
    
    const reportData = {
      title: 'Relatório de Comparação de Períodos',
      client: selectedClient === 'all' ? 'Todas as lojas' : clients?.find(c => c.id === selectedClient)?.name,
      data: comparisonData,
      generatedAt: new Date().toISOString()
    };
    
    onGeneratePDF(reportData, 'Comparacao_Periodos');
  };

  if (!comparisonData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecione um período</h3>
          <p className="text-muted-foreground">
            Escolha um período para gerar a comparação com o período anterior
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Comparação de Períodos</h2>
          <p className="text-muted-foreground">
            {format(comparisonData.periods.current.start, 'dd/MM/yyyy', { locale: ptBR })} - {' '}
            {format(comparisonData.periods.current.end, 'dd/MM/yyyy', { locale: ptBR })} vs Período Anterior
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">
                  R$ {comparisonData.current.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Anterior: R$ {comparisonData.previous.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Badge variant={comparisonData.changes.revenue >= 0 ? 'default' : 'destructive'}>
                {comparisonData.changes.revenue >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(comparisonData.changes.revenue).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-bold">{comparisonData.current.orders}</p>
                <p className="text-sm text-muted-foreground">
                  Anterior: {comparisonData.previous.orders}
                </p>
              </div>
              <Badge variant={comparisonData.changes.orders >= 0 ? 'default' : 'destructive'}>
                {comparisonData.changes.orders >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(comparisonData.changes.orders).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {comparisonData.current.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Anterior: R$ {comparisonData.previous.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Badge variant={comparisonData.changes.ticket >= 0 ? 'default' : 'destructive'}>
                {comparisonData.changes.ticket >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(comparisonData.changes.ticket).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Comparação Diária */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Diária - Comparação</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                currentRevenue: { label: "Período Atual", color: "hsl(var(--primary))" },
                previousRevenue: { label: "Período Anterior", color: "hsl(var(--muted-foreground))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData.dailyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="currentRevenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Período Atual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="previousRevenue" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Período Anterior"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Diários - Comparação</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                currentOrders: { label: "Período Atual", color: "hsl(var(--primary))" },
                previousOrders: { label: "Período Anterior", color: "hsl(var(--muted-foreground))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.dailyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="currentOrders" fill="hsl(var(--primary))" name="Período Atual" />
                  <Bar dataKey="previousOrders" fill="hsl(var(--muted-foreground))" name="Período Anterior" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
