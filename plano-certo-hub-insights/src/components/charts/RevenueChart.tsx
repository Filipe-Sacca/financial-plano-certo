
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import { ChartContainer } from "@/components/charts/chart-container";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RevenueChart = ({ data }: { data?: any[] }) => {
  // Processar dados reais se disponíveis
  const chartData = data && data.length > 0 
    ? data
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(metric => ({
          date: format(parseISO(metric.date), 'dd/MM', { locale: ptBR }),
          revenue: metric.revenue || 0,
          netRevenue: metric.net_revenue || 0
        }))
    : [
        { date: "01/01", revenue: 1200, netRevenue: 1000 },
        { date: "02/01", revenue: 1500, netRevenue: 1250 },
        { date: "03/01", revenue: 1800, netRevenue: 1500 },
        { date: "04/01", revenue: 1300, netRevenue: 1080 },
        { date: "05/01", revenue: 2000, netRevenue: 1680 },
        { date: "06/01", revenue: 1750, netRevenue: 1460 },
        { date: "07/01", revenue: 2200, netRevenue: 1850 },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento</CardTitle>
        <CardDescription>
          {data && data.length > 0 ? 'Dados reais dos últimos registros' : 'Dados de exemplo'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: "Faturamento Bruto",
              color: "hsl(var(--chart-1))",
            },
            netRevenue: {
              label: "Faturamento Líquido",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="netRevenue"
                stackId="2"
                stroke="var(--color-netRevenue)"
                fill="var(--color-netRevenue)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
