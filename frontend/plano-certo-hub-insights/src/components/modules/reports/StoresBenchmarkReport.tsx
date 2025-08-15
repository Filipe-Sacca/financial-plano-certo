
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trophy, TrendingUp, Store } from 'lucide-react';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useClients } from '@/hooks/useClients';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseISO, isWithinInterval } from 'date-fns';

interface StoresBenchmarkReportProps {
  dateRange: any;
  onGeneratePDF: (data: any, title: string) => void;
  isGenerating: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const StoresBenchmarkReport = ({ 
  dateRange, 
  onGeneratePDF, 
  isGenerating 
}: StoresBenchmarkReportProps) => {
  const { data: financialMetrics } = useFinancialMetrics();
  const { data: clients } = useClients();

  const benchmarkData = useMemo(() => {
    if (!financialMetrics || !clients || !dateRange?.from || !dateRange?.to) {
      return null;
    }

    // Filtrar métricas por período
    const filteredMetrics = financialMetrics.filter(metric => {
      const metricDate = parseISO(metric.date);
      return isWithinInterval(metricDate, { start: dateRange.from, end: dateRange.to });
    });

    // Agrupar por cliente
    const storeMetrics = clients.map(client => {
      const clientMetrics = filteredMetrics.filter(m => m.client_id === client.id);
      
      const totalRevenue = clientMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      const totalOrders = clientMetrics.reduce((sum, m) => sum + (m.orders_count || 0), 0);
      const totalCommission = clientMetrics.reduce((sum, m) => sum + (m.commission || 0), 0);
      const totalDeliveryFee = clientMetrics.reduce((sum, m) => sum + (m.delivery_fee || 0), 0);
      const netRevenue = totalRevenue - totalCommission - totalDeliveryFee;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const dailyAverage = clientMetrics.length > 0 ? totalRevenue / clientMetrics.length : 0;

      return {
        id: client.id,
        name: client.name,
        revenue: totalRevenue,
        orders: totalOrders,
        commission: totalCommission,
        deliveryFee: totalDeliveryFee,
        netRevenue,
        averageTicket,
        dailyAverage,
        profitMargin: totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0
      };
    }).filter(store => store.revenue > 0); // Apenas lojas com vendas

    // Ordenar por receita
    storeMetrics.sort((a, b) => b.revenue - a.revenue);

    // Calcular rankings
    const rankings = storeMetrics.map((store, index) => ({
      ...store,
      revenueRank: index + 1,
      ticketRank: [...storeMetrics].sort((a, b) => b.averageTicket - a.averageTicket).findIndex(s => s.id === store.id) + 1,
      ordersRank: [...storeMetrics].sort((a, b) => b.orders - a.orders).findIndex(s => s.id === store.id) + 1,
      profitRank: [...storeMetrics].sort((a, b) => b.profitMargin - a.profitMargin).findIndex(s => s.id === store.id) + 1
    }));

    // Dados para gráficos
    const chartData = rankings.map(store => ({
      name: store.name.length > 15 ? store.name.substring(0, 15) + '...' : store.name,
      fullName: store.name,
      revenue: store.revenue,
      orders: store.orders,
      averageTicket: store.averageTicket,
      profitMargin: store.profitMargin
    }));

    // Market share
    const totalMarketRevenue = rankings.reduce((sum, store) => sum + store.revenue, 0);
    const marketShare = rankings.map(store => ({
      name: store.name,
      value: store.revenue,
      percentage: (store.revenue / totalMarketRevenue) * 100
    }));

    return {
      stores: rankings,
      chartData,
      marketShare,
      totals: {
        revenue: totalMarketRevenue,
        orders: rankings.reduce((sum, store) => sum + store.orders, 0),
        stores: rankings.length
      }
    };
  }, [financialMetrics, clients, dateRange]);

  const handleGenerateReport = () => {
    if (!benchmarkData) return;
    
    const reportData = {
      title: 'Relatório de Benchmark entre Lojas',
      data: benchmarkData,
      period: dateRange,
      generatedAt: new Date().toISOString()
    };
    
    onGeneratePDF(reportData, 'Benchmark_Lojas');
  };

  if (!benchmarkData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecione um período</h3>
          <p className="text-muted-foreground">
            Escolha um período para gerar o benchmark entre lojas
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
          <h2 className="text-2xl font-bold">Benchmark entre Lojas</h2>
          <p className="text-muted-foreground">
            Comparação de performance entre {benchmarkData.totals.stores} lojas
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">
                  R$ {benchmarkData.totals.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{benchmarkData.totals.orders.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Store className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lojas Ativas</p>
                <p className="text-2xl font-bold">{benchmarkData.totals.stores}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita por Loja</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Receita", color: "hsl(var(--primary))" }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData.chartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Share</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={benchmarkData.marketShare}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {benchmarkData.marketShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loja</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-center">Rankings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benchmarkData.stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell className="text-right">
                    R$ {store.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">{store.orders}</TableCell>
                  <TableCell className="text-right">
                    R$ {store.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={store.profitMargin > 15 ? 'default' : 'secondary'}>
                      {store.profitMargin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      <Badge variant="outline" className="text-xs">#{store.revenueRank} Rev</Badge>
                      <Badge variant="outline" className="text-xs">#{store.ticketRank} Ticket</Badge>
                      <Badge variant="outline" className="text-xs">#{store.ordersRank} Ped</Badge>
                      <Badge variant="outline" className="text-xs">#{store.profitRank} Marg</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
