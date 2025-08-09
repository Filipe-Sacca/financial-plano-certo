import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar } from '@/components/ui/filter-bar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  UtensilsCrossed, 
  Wand2, 
  TrendingUp, 
  TrendingDown,
  Eye,
  DollarSign,
  Star,
  Image,
  ShoppingCart,
  Users,
  MousePointer,
  CheckSquare,
  Trophy,
  Percent,
  Filter
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface MenuOptimizationProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: { start: string; end: string };
}

export const MenuOptimization = ({ selectedClient: propSelectedClient, selectedPeriod: propSelectedPeriod, dateRange }: MenuOptimizationProps) => {
  const [selectedClient, setSelectedClient] = useState(propSelectedClient || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState(propSelectedPeriod || '30d');
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>();

  // Calcular range de datas local
  const calculatedDateRange = useMemo(() => {
    if (selectedPeriod === 'custom' && localDateRange) {
      return {
        start: format(localDateRange.from!, 'yyyy-MM-dd'),
        end: format(localDateRange.to || localDateRange.from!, 'yyyy-MM-dd')
      };
    }

    if (dateRange) return dateRange;

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
  }, [selectedPeriod, localDateRange, dateRange]);

  const clients = [
    { value: 'all', label: 'Todas as Lojas' },
    { value: 'pizzaria-center', label: 'Pizzaria Center' },
    { value: 'burger-house', label: 'Burger House' },
    { value: 'sushi-express', label: 'Sushi Express' },
    { value: 'grupo-fastfood', label: 'Grupo FastFood (3 lojas)' }
  ];

  const periods = [
    { value: '1d', label: 'Hoje' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '180d', label: 'Últimos 6 meses' },
    { value: '365d', label: 'Último ano' }
  ];

  const salesFunnel = {
    visits: 12450,
    views: 8320,
    cart: 3240,
    review: 2180,
    completed: 1847
  };

  const conversionRates = {
    visitToView: ((salesFunnel.views / salesFunnel.visits) * 100).toFixed(1),
    viewToCart: ((salesFunnel.cart / salesFunnel.views) * 100).toFixed(1),
    cartToReview: ((salesFunnel.review / salesFunnel.cart) * 100).toFixed(1),
    reviewToCompleted: ((salesFunnel.completed / salesFunnel.review) * 100).toFixed(1),
    overall: ((salesFunnel.completed / salesFunnel.visits) * 100).toFixed(1)
  };

  const productRanking = [
    {
      id: 1,
      name: 'Pizza Margherita Grande',
      category: 'Pizzas',
      visits: 1250,
      sales: 145,
      revenue: 4785.50,
      conversion: 11.6,
      position: 1,
      trend: 'up'
    },
    {
      id: 2,
      name: 'Hambúrguer Especial',
      category: 'Hambúrgueres',
      visits: 980,
      sales: 89,
      revenue: 2536.50,
      conversion: 9.1,
      position: 2,
      trend: 'down'
    },
    {
      id: 3,
      name: 'Pizza Calabresa Média',
      category: 'Pizzas',
      visits: 890,
      sales: 78,
      revenue: 2262.00,
      conversion: 8.8,
      position: 3,
      trend: 'up'
    },
    {
      id: 4,
      name: 'Refrigerante 2L',
      category: 'Bebidas',
      visits: 1450,
      sales: 67,
      revenue: 536.00,
      conversion: 4.6,
      position: 4,
      trend: 'stable'
    },
    {
      id: 5,
      name: 'Lasanha Bolonhesa',
      category: 'Massas',
      visits: 420,
      sales: 45,
      revenue: 1890.00,
      conversion: 10.7,
      position: 5,
      trend: 'up'
    }
  ];

  const menuItems = [
    {
      id: 1,
      name: 'Pizza Margherita',
      category: 'Pizzas',
      currentPrice: 32.90,
      suggestedPrice: 35.90,
      sales: 145,
      rating: 4.7,
      trend: 'up',
      needsOptimization: true,
      hasPhoto: true
    },
    {
      id: 2,
      name: 'Hambúrguer Especial',
      category: 'Hambúrgueres',
      currentPrice: 28.50,
      suggestedPrice: 28.50,
      sales: 89,
      rating: 4.5,
      trend: 'down',
      needsOptimization: true,
      hasPhoto: false
    },
    {
      id: 3,
      name: 'Lasanha Bolonhesa',
      category: 'Massas',
      currentPrice: 42.00,
      suggestedPrice: 39.90,
      sales: 67,
      rating: 4.8,
      trend: 'up',
      needsOptimization: false,
      hasPhoto: true
    }
  ];

  const optimizationSuggestions = [
    {
      type: 'description',
      title: 'Melhorar descrições',
      items: 8,
      impact: 'Alto',
      description: 'Produtos com descrições pouco atrativas'
    },
    {
      type: 'photo',
      title: 'Adicionar fotos',
      items: 12,
      impact: 'Muito Alto',
      description: 'Produtos sem fotos profissionais'
    },
    {
      type: 'price',
      title: 'Ajustar preços',
      items: 5,
      impact: 'Médio',
      description: 'Produtos com preços desalinhados'
    },
    {
      type: 'promotion',
      title: 'Criar promoções',
      items: 3,
      impact: 'Alto',
      description: 'Produtos com baixo desempenho'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Muito Alto': return 'bg-red-100 text-red-800';
      case 'Alto': return 'bg-orange-100 text-orange-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Baixo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Otimização de Cardápio
          </h1>
          <p className="text-gray-600">
            Use IA para otimizar descrições, fotos e preços dos produtos
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Analisar Tudo</span>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 flex items-center space-x-2">
            <Wand2 className="h-4 w-4" />
            <span>Otimizar com IA</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        dateRange={localDateRange}
        onDateRangeChange={setLocalDateRange}
      />

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnel">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="ranking">Ranking Produtos</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
          <TabsTrigger value="items">Itens Cardápio</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Funil de Vendas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-32 h-16 bg-blue-500 text-white flex items-center justify-center rounded-t-lg">
                      <div>
                        <div className="font-bold text-lg">{salesFunnel.visits.toLocaleString()}</div>
                        <div className="text-xs">Visitas</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <MousePointer className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-600">100%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-28 h-14 bg-green-500 text-white flex items-center justify-center">
                      <div>
                        <div className="font-bold">{salesFunnel.views.toLocaleString()}</div>
                        <div className="text-xs">Visualizações</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <Eye className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-gray-600">{conversionRates.visitToView}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-12 bg-yellow-500 text-white flex items-center justify-center">
                      <div>
                        <div className="font-bold">{salesFunnel.cart.toLocaleString()}</div>
                        <div className="text-xs">Sacola</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <ShoppingCart className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">{conversionRates.viewToCart}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-10 bg-orange-500 text-white flex items-center justify-center">
                      <div>
                        <div className="font-bold">{salesFunnel.review.toLocaleString()}</div>
                        <div className="text-xs">Revisão</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <Eye className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-gray-600">{conversionRates.cartToReview}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-8 bg-red-500 text-white flex items-center justify-center rounded-b-lg">
                      <div>
                        <div className="font-bold">{salesFunnel.completed.toLocaleString()}</div>
                        <div className="text-xs">Concluídos</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <CheckSquare className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-gray-600">{conversionRates.reviewToCompleted}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{conversionRates.visitToView}%</div>
                      <div className="text-sm text-gray-600">Visita → Visualização</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{conversionRates.viewToCart}%</div>
                      <div className="text-sm text-gray-600">Visualização → Sacola</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{conversionRates.cartToReview}%</div>
                      <div className="text-sm text-gray-600">Sacola → Revisão</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{conversionRates.reviewToCompleted}%</div>
                      <div className="text-sm text-gray-600">Revisão → Concluído</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{conversionRates.overall}%</div>
                      <div className="text-sm text-gray-600">Conversão Geral</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Ranking de Produtos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Visitas</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Conversão</TableHead>
                    <TableHead>Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productRanking.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            product.position === 1 ? 'bg-yellow-400 text-white' :
                            product.position === 2 ? 'bg-gray-400 text-white' :
                            product.position === 3 ? 'bg-orange-400 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {product.position}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>{product.visits.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4 text-gray-500" />
                          <span>{product.sales}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>R$ {product.revenue.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4 text-gray-500" />
                          <span>{product.conversion}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTrendIcon(product.trend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UtensilsCrossed className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                    <p className="text-sm text-gray-600">Itens no Cardápio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wand2 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">28</p>
                    <p className="text-sm text-gray-600">Precisam Otimização</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">+23%</p>
                    <p className="text-sm text-gray-600">Potencial Aumento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4.6</p>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Otimização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div 
                    key={suggestion.type}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {suggestion.title}
                      </h3>
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {suggestion.items} itens
                      </span>
                      <Button size="sm" variant="outline">
                        Otimizar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Cardápio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        item.hasPhoto ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Image className={`h-5 w-5 ${
                          item.hasPhoto ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.category} • {item.sales} vendas
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              R$ {item.currentPrice.toFixed(2)}
                            </span>
                            {item.suggestedPrice !== item.currentPrice && (
                              <span className="text-xs text-orange-600 font-medium">
                                → R$ {item.suggestedPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {item.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {item.needsOptimization && (
                        <Badge variant="destructive">
                          Otimização Necessária
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <Wand2 className="h-4 w-4 mr-1" />
                        Otimizar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
