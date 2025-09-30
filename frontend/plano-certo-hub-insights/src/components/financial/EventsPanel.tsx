/**
 * 📅 Painel de Eventos Financeiros
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Calendar } from 'lucide-react';
import { useFinancialEvents, useDateRangeFilter } from '@/hooks/financial/useFinancialData';
import { formatCurrency, formatDate } from '@/utils/format';

interface EventsPanelProps {
  merchantId: string;
}

export function EventsPanel({ merchantId }: EventsPanelProps) {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState<string>('');
  const { dateRange, setCustomRange } = useDateRangeFilter(30);
  const limit = 50;

  const { data, isLoading, error } = useFinancialEvents(merchantId, {
    page,
    limit,
    event_type: eventType || undefined,
    ...dateRange,
  });

  const getEventBadge = (eventName: string) => {
    const eventConfig = {
      PAYMENT_RECEIVED: { variant: 'success' as const, label: 'Pagamento Recebido' },
      SALE_CONCLUDED: { variant: 'default' as const, label: 'Venda Concluída' },
      CANCELLATION: { variant: 'destructive' as const, label: 'Cancelamento' },
      ADJUSTMENT: { variant: 'warning' as const, label: 'Ajuste' },
      CHARGEBACK: { variant: 'destructive' as const, label: 'Chargeback' },
    };

    const config = eventConfig[eventName as keyof typeof eventConfig] || {
      variant: 'secondary' as const,
      label: eventName,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos Financeiros</CardTitle>
        <CardDescription>
          Acompanhe todos os eventos que impactam seu saldo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="PAYMENT_RECEIVED">Pagamentos Recebidos</SelectItem>
                <SelectItem value="SALE_CONCLUDED">Vendas Concluídas</SelectItem>
                <SelectItem value="CANCELLATION">Cancelamentos</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajustes</SelectItem>
                <SelectItem value="CHARGEBACK">Chargebacks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                setCustomRange(new Date(e.target.value), new Date(dateRange.end_date))
              }
              className="w-40"
            />
            <Input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setCustomRange(new Date(dateRange.start_date), new Date(e.target.value))
              }
              className="w-40"
            />
          </div>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>

        {/* Tabela de Eventos */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Método de Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{formatDate(event.reference_date)}</TableCell>
                <TableCell>{getEventBadge(event.event_name)}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {event.event_description}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {event.reference_id}
                </TableCell>
                <TableCell>{event.payment_method || '-'}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(event.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Info de Paginação */}
        {data?.data && data.data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum evento encontrado para o período selecionado
          </div>
        )}

        {data?.pagination?.hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
            >
              Carregar mais eventos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}