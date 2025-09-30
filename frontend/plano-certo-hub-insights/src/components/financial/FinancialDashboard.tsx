/**
 * 📊 Dashboard Financeiro Principal
 *
 * Componente principal que exibe métricas financeiras
 * com cards de resumo e navegação para seções detalhadas
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  useFinancialSummary,
  useDateRangeFilter,
  useActiveMerchant,
} from '@/hooks/financial/useFinancialData';
import { formatCurrency, formatDate } from '@/utils/format';

export function FinancialDashboard() {
  const { merchantId, setMerchantId } = useActiveMerchant();
  const { dateRange, setPresetRange } = useDateRangeFilter(30);

  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useFinancialSummary(merchantId, dateRange);

  // Calcular variações percentuais
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (!merchantId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Selecione um Merchant</CardTitle>
            <CardDescription>
              Escolha um estabelecimento para visualizar os dados financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setMerchantId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um merchant" />
              </SelectTrigger>
              <SelectContent>
                {/* Lista de merchants seria carregada aqui */}
                <SelectItem value="merchant-1">Merchant 1</SelectItem>
                <SelectItem value="merchant-2">Merchant 2</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 mt-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
          <p className="text-sm text-gray-600">
            Acompanhe suas métricas financeiras em tempo real
          </p>
        </div>

        <div className="flex gap-4">
          {/* Seletor de período */}
          <Select
            defaultValue="30"
            onValueChange={(value) => setPresetRange(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">
              Erro ao carregar dados. Verifique se o token está configurado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card de Receita Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(summary?.data?.totalSettlements || 0)}
              </div>
              <div className="flex items-center text-sm mt-1">
                {summary?.data?.changePercent > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">
                      +{summary?.data?.changePercent?.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-500">
                      {summary?.data?.changePercent?.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-gray-600 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Card de Vendas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Vendas
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatCurrency(summary?.data?.totalSales || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {summary?.data?.salesCount || 0} pedidos
              </p>
            </CardContent>
          </Card>

          {/* Card de Eventos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Eventos Recentes
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {summary?.data?.recentEvents || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Nos últimos 7 dias</p>
            </CardContent>
          </Card>

          {/* Card de Última Atualização */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Última Atualização
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-semibold">
                {formatDate(summary?.data?.lastUpdate || new Date())}
              </div>
              <p className="text-sm text-gray-600 mt-1">Sincronizado</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resumo Financeiro Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>
            Visão geral das suas métricas financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Gráficos e métricas detalhadas aqui */}
          <p className="text-gray-600">
            Gráficos e análises detalhadas serão exibidos aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}