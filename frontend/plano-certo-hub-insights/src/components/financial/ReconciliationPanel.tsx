/**
 * 📋 Painel de Reconciliação
 *
 * Gerenciamento de reconciliação financeira e solicitação sob demanda
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  useReconciliation,
  useRequestReconciliation,
  useReconciliationStatus,
} from '@/hooks/financial/useFinancialData';
import { formatDate } from '@/utils/format';
import { toast } from '@/components/ui/use-toast';

interface ReconciliationPanelProps {
  merchantId: string;
}

export function ReconciliationPanel({ merchantId }: ReconciliationPanelProps) {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [activeRequestId, setActiveRequestId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: reconciliationData,
    isLoading,
    refetch,
  } = useReconciliation(
    merchantId,
    dateRange.start,
    dateRange.end,
    { page: 1, limit: 100 }
  );

  const requestMutation = useRequestReconciliation();

  const { data: statusData } = useReconciliationStatus(
    merchantId,
    activeRequestId,
    !!activeRequestId
  );

  const handleRequestReconciliation = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast({
        title: 'Erro',
        description: 'Selecione as datas de início e fim',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await requestMutation.mutateAsync({
        merchantId,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      if (response.data.requestId) {
        setActiveRequestId(response.data.requestId);
        toast({
          title: 'Solicitação enviada',
          description: 'A reconciliação está sendo processada',
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Erro ao solicitar reconciliação',
        description: 'Verifique suas credenciais e tente novamente',
        variant: 'destructive',
      });
    }
  };

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
      FAILED: {
        variant: 'destructive' as const,
        label: 'Falhou',
        icon: <AlertCircle className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline' as const,
      label: status,
      icon: null,
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reconciliação Financeira</CardTitle>
            <CardDescription>
              Gerencie e solicite relatórios de reconciliação
            </CardDescription>
          </div>

          <div className="flex gap-2">
            {/* Botão para solicitar reconciliação */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Solicitar Reconciliação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Reconciliação Sob Demanda</DialogTitle>
                  <DialogDescription>
                    Selecione o período para gerar o relatório de reconciliação
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Data Inicial</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, start: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">Data Final</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, end: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleRequestReconciliation}
                    disabled={requestMutation.isPending}
                  >
                    {requestMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Solicitando...
                      </>
                    ) : (
                      'Solicitar'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status de solicitação ativa */}
      {activeRequestId && statusData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Solicitação #{activeRequestId}:{' '}
              {getStatusBadge(statusData.data.status || 'PROCESSING')}
            </span>
            {statusData.data.status === 'COMPLETED' && (
              <Button variant="link" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros de período */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Período de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => refetch()}
                disabled={!dateRange.start || !dateRange.end}
              >
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de reconciliações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Reconciliações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reconciliationData?.data && reconciliationData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliationData.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.competence}</TableCell>
                    <TableCell>{formatDate(item.created_at_file)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.download_path}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Nenhuma reconciliação encontrada para o período selecionado</p>
              <p className="text-sm mt-2">
                Selecione um período e clique em "Buscar" ou solicite uma nova
                reconciliação
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}