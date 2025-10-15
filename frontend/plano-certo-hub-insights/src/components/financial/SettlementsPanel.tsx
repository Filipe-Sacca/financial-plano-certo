/**
 * 💳 Painel de Assentamentos Financeiros
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettlements } from '@/hooks/financial/useFinancialData';
import { formatCurrency, formatDate } from '@/utils/format';
import { CardTableSkeleton } from './TableSkeleton';

interface SettlementsPanelProps {
  merchantId: string;
}

export function SettlementsPanel({ merchantId }: SettlementsPanelProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useSettlements(merchantId, { page, limit });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { variant: 'success' as const, label: 'Pago' },
      PENDING: { variant: 'warning' as const, label: 'Pendente' },
      PROCESSING: { variant: 'secondary' as const, label: 'Processando' },
      FAILED: { variant: 'destructive' as const, label: 'Falhou' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'default' as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      console.warn('Nenhum dado para exportar');
      return;
    }

    try {
      // Preparar dados para CSV
      const csvHeaders = ['Data', 'Descrição', 'Tipo', 'Status', 'Valor'];
      const csvRows = data.data.map((settlement) => [
        formatDate(settlement.settlement_date),
        settlement.description || '-',
        settlement.type,
        settlement.status,
        settlement.amount.toFixed(2),
      ]);

      // Montar CSV
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row) =>
          row.map((cell) => `"${cell}"`).join(',')
        ),
      ].join('\n');

      // Criar blob e fazer download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `settlements_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  if (isLoading) {
    return <CardTableSkeleton rows={5} columns={5} showActions={true} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-red-600">Erro ao carregar assentamentos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assentamentos Financeiros</CardTitle>
          <CardDescription>
            Histórico de pagamentos e transferências
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((settlement) => (
              <TableRow key={settlement.id}>
                <TableCell>{formatDate(settlement.settlement_date)}</TableCell>
                <TableCell>{settlement.description || '-'}</TableCell>
                <TableCell>{settlement.type}</TableCell>
                <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(settlement.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Página {page} de {Math.ceil((data?.data?.length || 0) / limit)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.pagination?.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}