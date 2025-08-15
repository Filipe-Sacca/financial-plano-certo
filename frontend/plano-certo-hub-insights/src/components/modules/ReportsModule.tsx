
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Building,
  Settings,
  Users
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { RevenueComparisonReport } from './reports/RevenueComparisonReport';
import { StoresBenchmarkReport } from './reports/StoresBenchmarkReport';
import { CustomReportBuilder } from './reports/CustomReportBuilder';
import { ReportsList } from './reports/ReportsList';
import { generateReportPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { addDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

interface ReportsModuleProps {
  selectedClient?: string;
  selectedPeriod?: string;
  dateRange?: { start: string; end: string };
}

export const ReportsModule = ({ selectedClient: propSelectedClient, selectedPeriod: propSelectedPeriod, dateRange: propDateRange }: ReportsModuleProps) => {
  const [selectedClient, setSelectedClient] = useState(propSelectedClient || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [dateRange, setDateRange] = useState<any>(null);
  const [reportType, setReportType] = useState('revenue');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: clients } = useClients();

  // Função para calcular o período baseado na seleção
  const getDateRangeFromPeriod = (period: string) => {
    const today = new Date();
    switch (period) {
      case 'current-month':
        return {
          from: startOfMonth(today),
          to: endOfMonth(today)
        };
      case 'previous-month':
        const prevMonth = subMonths(today, 1);
        return {
          from: startOfMonth(prevMonth),
          to: endOfMonth(prevMonth)
        };
      case 'last-7-days':
        return {
          from: addDays(today, -7),
          to: today
        };
      case 'custom':
        return dateRange;
      default:
        return null;
    }
  };

  // Atualizar dateRange quando o período muda
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      setDateRange(getDateRangeFromPeriod(period));
    }
  };

  // Calcular o período efetivo baseado na seleção
  const effectiveDateRange = selectedPeriod === 'custom' ? dateRange : getDateRangeFromPeriod(selectedPeriod);

  const handleGeneratePDF = async (reportData: any, reportTitle: string) => {
    setIsGenerating(true);
    try {
      await generateReportPDF(reportData, reportTitle);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF');
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
        <p className="text-muted-foreground">
          Gere análises detalhadas, comparações e benchmarks
        </p>
      </div>

      {/* Filtros Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Loja</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {selectedPeriod === 'custom' ? (
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                    className="w-full"
                  />
                ) : (
                  <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Mês Vigente</SelectItem>
                      <SelectItem value="previous-month">Mês Anterior</SelectItem>
                      <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Análise de Receita</SelectItem>
                  <SelectItem value="comparison">Comparação de Períodos</SelectItem>
                  <SelectItem value="benchmark">Benchmark entre Lojas</SelectItem>
                  <SelectItem value="custom">Relatório Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatório */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Receita
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparação
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Benchmark
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Personalizado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <ReportsList 
            selectedClient={selectedClient}
            dateRange={effectiveDateRange}
            onGeneratePDF={handleGeneratePDF}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="comparison">
          <RevenueComparisonReport 
            selectedClient={selectedClient}
            dateRange={effectiveDateRange}
            onGeneratePDF={handleGeneratePDF}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="benchmark">
          <StoresBenchmarkReport 
            dateRange={effectiveDateRange}
            onGeneratePDF={handleGeneratePDF}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="custom">
          <CustomReportBuilder 
            selectedClient={selectedClient}
            dateRange={effectiveDateRange}
            onGeneratePDF={handleGeneratePDF}
            isGenerating={isGenerating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
