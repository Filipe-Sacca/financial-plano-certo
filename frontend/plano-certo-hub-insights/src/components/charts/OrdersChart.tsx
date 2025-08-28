
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
} from "recharts";
import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import { ChartContainer } from "@/components/charts/chart-container";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OrdersChart = ({ data }: { data?: any[] }) => {
  // Processar dados reais se disponíveis
  const chartData = data && data.length > 0 
    ? data
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(metric => ({
          date: format(parseISO(metric.date), 'dd/MM', { locale: ptBR }),
          orders: metric.orders_count || 0,
          averageTicket: metric.average_ticket || 0
        }))
    : [
        { date: "01/01", orders: 45, averageTicket: 26.7 },
        { date: "02/01", orders: 52, averageTicket: 28.8 },
        { date: "03/01", orders: 61, averageTicket: 29.5 },
        { date: "04/01", orders: 48, averageTicket: 27.1 },
        { date: "05/01", orders: 67, averageTicket: 29.9 },
        { date: "06/01", orders: 58, averageTicket: 30.2 },
        { date: "07/01", orders: 72, averageTicket: 30.6 },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos e Ticket Médio</CardTitle>
        <CardDescription>
          {data && data.length > 0 ? 'Dados reais dos últimos registros' : 'Dados de exemplo'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            orders: {
              label: "Pedidos",
              color: "hsl(var(--chart-3))",
            },
            averageTicket: {
              label: "Ticket Médio",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  name === 'averageTicket' 
                    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                    : value.toString(),
                ]}
              />
              <Bar
                yAxisId="left"
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageTicket"
                stroke="var(--color-averageTicket)"
                strokeWidth={3}
                dot={{ fill: "var(--color-averageTicket)", r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
