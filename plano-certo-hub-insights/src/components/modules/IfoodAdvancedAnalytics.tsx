import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/ui/filter-bar';
import { useClients } from '@/hooks/useClients';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, CreditCard, ShoppingCart, Target, DollarSign } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface IfoodAdvancedAnalyticsProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: DateRange;
}

const IfoodAdvancedAnalytics: React.FC<IfoodAdvancedAnalyticsProps> = ({
  selectedClient: propSelectedClient,
  selectedPeriod: propSelectedPeriod,
  dateRange: propDateRange
}) => {
  const { data: clients = [] } = useClients();
  
  const [selectedClient, setSelectedClient] = useState(propSelectedClient || '');
  const [selectedPeriod, setSelectedPeriod] = useState(propSelectedPeriod || 'current_month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(propDateRange);

  // Remover mockAnalytics e comentários relacionados

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!selectedClient) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Selecione um cliente para visualizar a análise financeira especializada do iFood.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Concluídos: 0</span>
              <span>•</span>
              <span>Cancelados: 0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>+0% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              <span>-0% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <div className="text-xs text-muted-foreground">
              Margem: {formatPercentage(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="promotions">Promoções</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="executive">Resumo Executivo</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Análise Detalhada por Forma de Pagamento
              </CardTitle>
              <CardDescription>
                Participação de cada método no volume de pedidos e faturamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Object.entries(mockAnalytics.paymentMethods).map(([method, data]) => ( */}
                {/*   <div key={method} className="space-y-2"> */}
                {/*     <div className="flex justify-between items-center"> */}
                {/*       <span className="font-medium">{method}</span> */}
                {/*       <div className="flex space-x-4 text-sm text-muted-foreground"> */}
                {/*         <span>{data.orders} pedidos</span> */}
                {/*         <span>{formatCurrency(data.revenue)}</span> */}
                {/*       </div> */}
                {/*     </div> */}
                {/*     <div className="grid grid-cols-2 gap-4"> */}
                {/*       <div> */}
                {/*         <div className="flex justify-between text-xs"> */}
                {/*           <span>% Pedidos</span> */}
                {/*           <span>{formatPercentage(data.ordersPercentage)}</span> */}
                {/*         </div> */}
                {/*         <Progress value={data.ordersPercentage} className="h-2" /> */}
                {/*       </div> */}
                {/*       <div> */}
                {/*         <div className="flex justify-between text-xs"> */}
                {/*           <span>% Receita</span> */}
                {/*           <span>{formatPercentage(data.revenuePercentage)}</span> */}
                {/*         </div> */}
                {/*         <Progress value={data.revenuePercentage} className="h-2" /> */}
                {/*       </div> */}
                {/*     </div> */}
                {/*   </div> */}
                {/* ))} */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Promoções iFood</CardTitle>
                <CardDescription>Valor total custeado pelo iFood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {formatCurrency(0)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {formatPercentage(0)} do faturamento
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promoções da Loja</CardTitle>
                <CardDescription>Valor total custeado pela loja</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(0)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {formatPercentage(0)} do faturamento
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Comissão iFood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPercentage(0)} do faturamento
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comissão Transação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPercentage(0)} do faturamento
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa Plano Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPercentage(0)} do faturamento
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Faturamento Bruto:</span>
                  <span className="font-bold">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>(-) Comissões Totais:</span>
                  <span className="font-bold">
                    {formatCurrency(
                      0 + 
                      0 + 
                      0
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-green-600">
                  <span className="font-bold">Receita Líquida:</span>
                  <span className="font-bold">{formatCurrency(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Executivo</CardTitle>
              <CardDescription>Insights e análise consolidada do período</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">📈 Performance Geral</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Total de 0 pedidos processados</li>
                    <li>• Taxa de sucesso: {formatPercentage(0)}</li>
                    <li>• Ticket médio de {formatCurrency(0)}</li>
                    <li>• Melhor dia: 0000-00-00 ({0} pedidos)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">💳 Preferências de Pagamento</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cartão de Crédito lidera com 0% dos pedidos</li>
                    <li>• PIX representa 0% do volume</li>
                    <li>• Dinheiro ainda representa 0% dos pagamentos</li>
                    <li>• Cartão de Débito com 0% de participação</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">💰 Análise Financeira</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    O faturamento bruto de <strong>{formatCurrency(0)}</strong> resultou 
                    em uma receita líquida de <strong>{formatCurrency(0)}</strong>, 
                    representando uma margem líquida de <strong>
                    {formatPercentage(0)}
                    </strong>. As comissões totais (iFood + transação + plano) somaram <strong>
                    {formatCurrency(
                      0 + 
                      0 + 
                      0
                    )}
                    </strong>, representando <strong>
                    {formatPercentage(((0 + 0 + 0) / 0) * 100)}
                    </strong> do faturamento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IfoodAdvancedAnalytics;