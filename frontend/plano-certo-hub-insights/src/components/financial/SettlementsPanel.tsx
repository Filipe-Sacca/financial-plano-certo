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
    // Implementar export para CSV
    console.log('Exportando settlements...');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
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