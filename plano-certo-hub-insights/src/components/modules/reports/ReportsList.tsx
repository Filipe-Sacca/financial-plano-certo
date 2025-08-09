
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useClients } from '@/hooks/useClients';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseISO, isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportsListProps {
  selectedClient: string;
  dateRange: any;
  onGeneratePDF: (data: any, title: string) => void;
  isGenerating: boolean;
}

export const ReportsList = ({ 
  selectedClient, 
  dateRange, 
  onGeneratePDF, 
  isGenerating 
}: ReportsListProps) => {
  const { data: financialMetrics } = useFinancialMetrics();
  const { data: clients } = useClients();

  const reportData = useMemo(() => {
    if (!financialMetrics) return null;

    let filteredData = financialMetrics;

    // Filtrar por cliente
    if (selectedClient && selectedClient !== 'all') {
      filteredData = filteredData.filter(m => m.client_id === selectedClient);
    }

    // Filtrar por período
    if (dateRange?.from && dateRange?.to) {
      filteredData = filteredData.filter(m => {
        const metricDate = parseISO(m.date);
        return isWithinInterval(metricDate, { start: dateRange.from, end: dateRange.to });
      });
    }

    // Calcular métricas
    const totalRevenue = filteredData.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const totalOrders = filteredData.reduce((sum, m) => sum + (m.orders_count || 0), 0);
    const totalCommission = filteredData.reduce((sum, m) => sum + (m.commission || 0), 0);
    const totalDeliveryFee = filteredData.reduce((sum, m) => sum + (m.delivery_fee || 0), 0);
    const netRevenue = totalRevenue - totalCommission - totalDeliveryFee;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Preparar dados para gráfico
    const chartData = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(metric => ({
        date: format(parseISO(metric.date), 'dd/MM', { locale: ptBR }),
        fullDate: metric.date,
        revenue: metric.revenue || 0,
        orders: metric.orders_count || 0,
        commission: metric.commission || 0,
        netRevenue: (metric.revenue || 0) - (metric.commission || 0) - (metric.delivery_fee || 0)
      }));

    // Top 10 dias com maior receita
    const topDays = [...filteredData]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 10)
      .map(metric => ({
        date: format(parseISO(metric.date), 'dd/MM/yyyy', { locale: ptBR }),
        revenue: metric.revenue || 0,
        orders: metric.orders_count || 0,
        averageTicket: (metric.orders_count || 0) > 0 ? (metric.revenue || 0) / (metric.orders_count || 0) : 0
      }));

    return {
      summary: {
        totalRevenue,
        totalOrders,
        totalCommission,
        totalDeliveryFee,
        netRevenue,
        averageTicket
      },
      chartData,
      topDays,
      rawData: filteredData
    };
  }, [financialMetrics, selectedClient, dateRange]);

  const handleGenerateReport = () => {
    if (!reportData) return;
    
    const reportPayload = {
      title: 'Relatório de Receita Detalhado',
      client: selectedClient === 'all' ? 'Todas as lojas' : clients?.find(c => c.id === selectedClient)?.name,
      period: dateRange,
      data: reportData,
      generatedAt: new Date().toISOString()
    };
    
    onGeneratePDF(reportPayload, 'Relatorio_Receita');
  };

  if (!reportData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dados insuficientes</h3>
          <p className="text-muted-foreground">
            Selecione um cliente e período para gerar o relatório
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
          <h2 className="text-2xl font-bold">Relatório de Receita</h2>
          <p className="text-muted-foreground">
            Análise detalhada de performance financeira
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
                <p className="text-2xl font-bold">
                  R$ {reportData.summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Líquida</p>
                <p className="text-2xl font-bold">
                  R$ {reportData.summary.netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Badge variant="secondary">
                {((reportData.summary.netRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{reportData.summary.totalOrders}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {reportData.summary.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Receita Bruta", color: "hsl(var(--primary))" },
                netRevenue: { label: "Receita Líquida", color: "hsl(var(--chart-2))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Receita Bruta"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netRevenue" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Receita Líquida"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                orders: { label: "Pedidos", color: "hsl(var(--chart-3))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="hsl(var(--chart-3))" name="Pedidos" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Dias */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Dias com Maior Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.topDays.map((day, index) => (
                <TableRow key={day.date}>
                  <TableCell>
                    <Badge variant={index < 3 ? 'default' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell className="text-right">
                    R$ {day.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">{day.orders}</TableCell>
                  <TableCell className="text-right">
                    R$ {day.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Custos e Taxas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Comissões</span>
                <div className="text-right">
                  <p className="font-medium">
                    R$ {reportData.summary.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((reportData.summary.totalCommission / reportData.summary.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Entrega</span>
                <div className="text-right">
                  <p className="font-medium">
                    R$ {reportData.summary.totalDeliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((reportData.summary.totalDeliveryFee / reportData.summary.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total de Custos</span>
                  <div className="text-right">
                    <p className="font-bold">
                      R$ {(reportData.summary.totalCommission + reportData.summary.totalDeliveryFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(((reportData.summary.totalCommission + reportData.summary.totalDeliveryFee) / reportData.summary.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {((reportData.summary.netRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Margem Líquida</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Receita Bruta</span>
                  <span>100%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Custos Totais</span>
                  <span>{(((reportData.summary.totalCommission + reportData.summary.totalDeliveryFee) / reportData.summary.totalRevenue) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Lucro Líquido</span>
                  <span>{((reportData.summary.netRevenue / reportData.summary.totalRevenue) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
