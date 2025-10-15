/**
 * 🛒 Painel de Vendas
 *
 * Exibe vendas dos últimos 7 dias (limitação da API do iFood)
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoIcon, Loader2, RefreshCw, ShoppingCart } from 'lucide-react';
import { useSales } from '@/hooks/financial/useFinancialData';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';
import { DashboardCardSkeleton, CardTableSkeleton } from './TableSkeleton';

interface SalesPanelProps {
  merchantId: string;
}

export function SalesPanel({ merchantId }: SalesPanelProps) {
  const { data, isLoading, error, refetch } = useSales(merchantId, {
    page: 1,
    limit: 100,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONCLUDED: { variant: 'success' as const, label: 'Concluída' },
      CONFIRMED: { variant: 'default' as const, label: 'Confirmada' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelada' },
      DISPATCHED: { variant: 'secondary' as const, label: 'Despachada' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline' as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calcular métricas das vendas
  const calculateMetrics = () => {
    if (!data?.data) return { total: 0, count: 0, average: 0 };

    const sales = data.data;
    const total = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const count = sales.length;
    const average = count > 0 ? total / count : 0;

    return { total, count, average };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Limitação da API</AlertTitle>
          <AlertDescription>
            A API do iFood retorna apenas vendas dos últimos 7 dias.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
        <CardTableSkeleton rows={5} columns={5} showActions={true} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerta sobre limitação de 7 dias */}
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Limitação da API</AlertTitle>
        <AlertDescription>
          A API do iFood retorna apenas vendas dos últimos 7 dias. Para dados históricos,
          utilize a funcionalidade de importação de relatórios.
        </AlertDescription>
      </Alert>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Vendas (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(metrics.total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Número de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{metrics.count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(metrics.average)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Últimos 7 dias de vendas processadas</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-600">
              Erro ao carregar vendas. Verifique sua autenticação.
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método de Pagamento</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div>
                        <div>{formatDate(sale.created_at)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTime(sale.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {sale.order_id}
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>{sale.payment_method || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(sale.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda encontrada nos últimos 7 dias</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}