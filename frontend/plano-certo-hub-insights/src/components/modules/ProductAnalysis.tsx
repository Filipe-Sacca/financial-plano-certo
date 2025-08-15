
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useProductSales } from '@/hooks/useProductSales';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, Eye, Target, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/ui/filter-bar';
import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ProductAnalysisProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: { start: string; end: string };
}

export const ProductAnalysis = ({ selectedClient, selectedPeriod, dateRange }: ProductAnalysisProps) => {
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

  const { data: products } = useProducts(localSelectedClient === 'all' ? undefined : localSelectedClient);
  const { data: productSales } = useProductSales(localSelectedClient === 'all' ? undefined : localSelectedClient);

  // Processar dados para métricas
  const topProducts = productSales?.slice(0, 10).map((sale: any) => ({
    name: sale.products?.name || 'Produto não identificado',
    category: sale.products?.category || 'Sem categoria',
    sales: sale.quantity_sold || 0,
    revenue: sale.revenue || 0,
    views: sale.views || 0,
    ranking: sale.ranking || 0,
    conversionRate: sale.views > 0 ? ((sale.quantity_sold || 0) / sale.views * 100) : 0
  })) || [];

  // Agrupar por categoria
  const categoryData = productSales?.reduce((acc: any, sale: any) => {
    const category = sale.products?.category || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = {
        name: category,
        sales: 0,
        revenue: 0,
        views: 0
      };
    }
    acc[category].sales += sale.quantity_sold || 0;
    acc[category].revenue += sale.revenue || 0;
    acc[category].views += sale.views || 0;
    return acc;
  }, {});

  const categoryChart = Object.values(categoryData || {});

  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calcular métricas gerais
  const totalSales = productSales?.reduce((sum: number, sale: any) => sum + (sale.quantity_sold || 0), 0) || 0;
  const totalRevenue = productSales?.reduce((sum: number, sale: any) => sum + (sale.revenue || 0), 0) || 0;
  const totalViews = productSales?.reduce((sum: number, sale: any) => sum + (sale.views || 0), 0) || 0;
  const averageConversion = totalViews > 0 ? (totalSales / totalViews * 100) : 0;

  const bestProduct = topProducts[0];
  const bestCategory = categoryChart.length > 0 ? 
    categoryChart.reduce((prev: any, current: any) => (prev.revenue > current.revenue) ? prev : current) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análise de Produtos</h1>
        <p className="text-muted-foreground">
          Desempenho detalhado dos produtos, conversões e categorias
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

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              unidades vendidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              em vendas de produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              visualizações de produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              conversão média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produtos Mais Vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
          <CardDescription>
            Ranking dos produtos por quantidade de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{product.ranking || index + 1}
                    </Badge>
                    <h4 className="font-medium text-sm">
                      {product.name.length > 50 ? product.name.substring(0, 50) + '...' : product.name}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium">{product.sales} vendas</div>
                  <div className="text-xs text-muted-foreground">
                    {product.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-green-600">
                    {product.conversionRate.toFixed(1)}% conversão
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Vendas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>
              Distribuição de vendas entre categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {categoryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Vendas']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receita por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
            <CardDescription>
              Faturamento gerado por cada categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [
                    parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    'Receita'
                  ]}
                />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Destaques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bestProduct && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">🏆 Produto Campeão</h4>
                <p className="text-sm text-green-700 mt-1">
                  {bestProduct.name.substring(0, 40)}...
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {bestProduct.sales} vendas • {bestProduct.conversionRate.toFixed(1)}% conversão
                </p>
              </div>
            )}

            {bestCategory && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">📊 Melhor Categoria</h4>
                <p className="text-sm text-blue-700 mt-1">{(bestCategory as any).name}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {((bestCategory as any).revenue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em receita
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Recomendações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
              <p className="text-sm font-medium text-orange-800">Otimize produtos com baixa conversão</p>
              <p className="text-xs text-orange-600 mt-1">
                Revise descrições e imagens dos produtos com menos de 20% de conversão
              </p>
            </div>
            
            <div className="p-3 border-l-4 border-green-500 bg-green-50">
              <p className="text-sm font-medium text-green-800">Promova os campeões</p>
              <p className="text-xs text-green-600 mt-1">
                Destaque os produtos mais vendidos na página inicial do seu cardápio
              </p>
            </div>
            
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <p className="text-sm font-medium text-blue-800">Diversifique o cardápio</p>
              <p className="text-xs text-blue-600 mt-1">
                Considere adicionar mais opções nas categorias com melhor performance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
