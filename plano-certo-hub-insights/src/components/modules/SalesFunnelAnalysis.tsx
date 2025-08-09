import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenuFunnel } from '@/hooks/useMenuFunnel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, Cell, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, Eye, MousePointer, ShoppingCart, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/ui/filter-bar';
import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface SalesFunnelAnalysisProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: { start: string; end: string };
}

export const SalesFunnelAnalysis = ({ selectedClient, selectedPeriod, dateRange }: SalesFunnelAnalysisProps) => {
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

  const { data: funnelData } = useMenuFunnel(localSelectedClient === 'all' ? undefined : localSelectedClient);

  const processedData = funnelData?.reduce((acc: any, item: any) => {
    acc.totalImpressions += item.impressions || 0;
    acc.totalViews += item.views || 0;
    acc.totalClicks += item.clicks || 0;
    acc.totalAddToCarts += item.add_to_cart || 0;
    acc.totalConversions += item.conversions || 0;
    return acc;
  }, {
    totalImpressions: 0,
    totalViews: 0,
    totalClicks: 0,
    totalAddToCarts: 0,
    totalConversions: 0
  });

  const funnelSteps = [
    {
      name: 'Visitas',
      value: processedData?.totalImpressions || 0,
      fill: '#8884d8',
      percentage: 100,
      icon: Eye
    },
    {
      name: 'Visualizações',
      value: processedData?.totalViews || 0,
      fill: '#82ca9d',
      percentage: processedData?.totalViews > 0 ? ((processedData.totalViews / processedData.totalImpressions) * 100).toFixed(1) : '0',
      icon: Eye
    },
    {
      name: 'Revisão',
      value: processedData?.totalClicks || 0,
      fill: '#ffc658',
      percentage: processedData?.totalClicks > 0 ? ((processedData.totalClicks / processedData.totalImpressions) * 100).toFixed(1) : '0',
      icon: MousePointer
    },
    {
      name: 'Sacola',
      value: processedData?.totalAddToCarts || 0,
      fill: '#ff7300',
      percentage: processedData?.totalAddToCarts > 0 ? ((processedData.totalAddToCarts / processedData.totalImpressions) * 100).toFixed(1) : '0',
      icon: ShoppingCart
    },
    {
      name: 'Concluídos',
      value: processedData?.totalConversions || 0,
      fill: '#00C49F',
      percentage: processedData?.totalConversions > 0 ? ((processedData.totalConversions / processedData.totalImpressions) * 100).toFixed(1) : '0',
      icon: CheckCircle
    }
  ];

  const conversionRates = [
    {
      step: 'Visitas → Visualizações',
      rate: processedData?.totalImpressions > 0 ? ((processedData.totalViews / processedData.totalImpressions) * 100).toFixed(1) : '0',
      value: processedData.totalViews
    },
    {
      step: 'Visualizações → Revisão',
      rate: processedData.totalViews > 0 ? ((processedData.totalClicks / processedData.totalViews) * 100).toFixed(1) : '0',
      value: processedData.totalClicks
    },
    {
      step: 'Revisão → Sacola',
      rate: processedData.totalClicks > 0 ? ((processedData.totalAddToCarts / processedData.totalClicks) * 100).toFixed(1) : '0',
      value: processedData.totalAddToCarts
    },
    {
      step: 'Sacola → Concluídos',
      rate: processedData.totalAddToCarts > 0 ? ((processedData.totalConversions / processedData.totalAddToCarts) * 100).toFixed(1) : '0',
      value: processedData.totalConversions
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análise do Funil de Vendas</h1>
        <p className="text-muted-foreground">
          Acompanhe o comportamento dos clientes desde a visita até a conversão
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {funnelSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{step.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{step.value.toLocaleString()}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{step.percentage}%</Badge>
                  <span>do total</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico do Funil */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Visualização do fluxo de visitantes através das etapas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={funnelSteps} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value.toLocaleString()} (${funnelSteps.find(s => s.name === name)?.percentage}%)`,
                    name
                  ]}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxas de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle>Taxas de Conversão</CardTitle>
            <CardDescription>
              Performance entre cada etapa do funil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionRates.map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{conversion.step}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversion.value.toLocaleString()} conversões
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {conversion.rate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📊 Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Taxa de Conversão Geral</h4>
              <p className="text-sm text-blue-700 mt-1">
                {processedData?.totalImpressions > 0 ? ((processedData.totalConversions / processedData.totalImpressions) * 100).toFixed(1) : '0'}% dos visitantes concluem o pedido
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Maior Perda</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Entre Visitas e Visualizações: {processedData?.totalImpressions > 0 ? ((1 - (processedData.totalViews / processedData.totalImpressions)) * 100).toFixed(1) : '0'}% de abandono
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Melhor Conversão</h4>
              <p className="text-sm text-green-700 mt-1">
                Revisão → Sacola: {processedData?.totalClicks > 0 ? ((processedData.totalAddToCarts / processedData.totalClicks) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Recomendações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
              <p className="text-sm font-medium text-orange-800">Otimize a página inicial</p>
              <p className="text-xs text-orange-600 mt-1">
                Melhore fotos e descrições para aumentar visualizações
              </p>
            </div>
            
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <p className="text-sm font-medium text-blue-800">Simplifique o checkout</p>
              <p className="text-xs text-blue-600 mt-1">
                Reduza etapas no processo de finalização do pedido
              </p>
            </div>
            
            <div className="p-3 border-l-4 border-green-500 bg-green-50">
              <p className="text-sm font-medium text-green-800">Promova produtos populares</p>
              <p className="text-xs text-green-600 mt-1">
                Destaque itens com melhor taxa de conversão
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
