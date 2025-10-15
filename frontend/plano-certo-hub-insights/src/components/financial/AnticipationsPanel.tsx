/**
 * 💵 Painel de Antecipações Financeiras
 *
 * Exibe antecipações de recebíveis contratadas pelo merchant
 * Disponível apenas para merchants com plano de antecipação
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAnticipations } from '@/hooks/financial/useFinancialData';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FiltersSkeleton, CardTableSkeleton } from './TableSkeleton';

interface AnticipationsPanelProps {
  merchantId: string;
}

export function AnticipationsPanel({ merchantId }: AnticipationsPanelProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const limit = 20;

  const { data, isLoading, error, refetch } = useAnticipations(merchantId, {
    page,
    limit,
    status: statusFilter || undefined,
    start_date: dateRange.start || undefined,
    end_date: dateRange.end || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: {
        variant: 'success' as const,
        label: 'Concluída',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      PROCESSING: {
        variant: 'secondary' as const,
        label: 'Processando',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
      },
      PENDING: {
        variant: 'warning' as const,
        label: 'Pendente',
        icon: <Clock className="h-3 w-3" />,
      },
      CANCELLED: {
        variant: 'destructive' as const,
        label: 'Cancelada',
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'default' as const,
      label: status,
      icon: <AlertCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleApplyFilters = () => {
    setPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setDateRange({ start: '', end: '' });
    setPage(1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FiltersSkeleton />
        <CardTableSkeleton rows={5} columns={7} showActions={false} />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Erro ao carregar antecipações</p>
            <p className="text-sm text-gray-600 mt-2">
              Verifique se este merchant possui plano de antecipação contratado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não há dados e não há erro, pode ser que o merchant não tenha antecipações
  const hasNoData = !data?.data || data.data.length === 0;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro de Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="PROCESSING">Processando</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2">
              <Label className="invisible">Ações</Label>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Aplicar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex-1"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Antecipações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Antecipações de Recebíveis</CardTitle>
            <CardDescription>
              Histórico de antecipações solicitadas e processadas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {hasNoData ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                Nenhuma antecipação encontrada
              </p>
              <p className="text-sm text-gray-500">
                {statusFilter || dateRange.start || dateRange.end
                  ? 'Tente ajustar os filtros para ver mais resultados'
                  : 'Este merchant não possui antecipações ou não tem o plano de antecipação contratado'}
              </p>
            </div>
          ) : (
            <>
              {/* Alerta informativo */}
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  As antecipações são valores que foram pagos antecipadamente ao merchant.
                  As taxas são descontadas do valor bruto.
                </AlertDescription>
              </Alert>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Taxa (%)</TableHead>
                    <TableHead className="text-right">Valor da Taxa</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((anticipation) => (
                    <TableRow key={anticipation.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatDate(anticipation.begin_date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            até {formatDate(anticipation.end_date)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(anticipation.status || 'PENDING')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(anticipation.balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {anticipation.anticipation_data?.fee_percentage
                          ? `${anticipation.anticipation_data.fee_percentage}%`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {anticipation.anticipation_data?.fee_amount
                          ? formatCurrency(anticipation.anticipation_data.fee_amount)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {anticipation.anticipation_data?.net_amount
                          ? formatCurrency(anticipation.anticipation_data.net_amount)
                          : formatCurrency(anticipation.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {anticipation.anticipation_data?.anticipation_type || 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Página {page} {data?.pagination?.hasMore && '- há mais resultados'}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data?.pagination?.hasMore}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
