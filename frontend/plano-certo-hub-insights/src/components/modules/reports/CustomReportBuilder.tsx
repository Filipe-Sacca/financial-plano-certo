
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Settings, Plus, X } from 'lucide-react';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useClients } from '@/hooks/useClients';
import { toast } from 'sonner';

interface CustomReportBuilderProps {
  selectedClient: string;
  dateRange: any;
  onGeneratePDF: (data: any, title: string) => void;
  isGenerating: boolean;
}

interface ReportField {
  id: string;
  label: string;
  type: 'metric' | 'chart' | 'table';
  selected: boolean;
}

interface CustomFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const availableFields: ReportField[] = [
  { id: 'revenue', label: 'Receita Total', type: 'metric', selected: true },
  { id: 'orders', label: 'Número de Pedidos', type: 'metric', selected: true },
  { id: 'average_ticket', label: 'Ticket Médio', type: 'metric', selected: true },
  { id: 'commission', label: 'Comissões', type: 'metric', selected: false },
  { id: 'delivery_fee', label: 'Taxa de Entrega', type: 'metric', selected: false },
  { id: 'net_revenue', label: 'Receita Líquida', type: 'metric', selected: false },
  { id: 'revenue_chart', label: 'Gráfico de Receita', type: 'chart', selected: true },
  { id: 'orders_chart', label: 'Gráfico de Pedidos', type: 'chart', selected: false },
  { id: 'daily_breakdown', label: 'Detalhamento Diário', type: 'table', selected: false },
  { id: 'weekly_summary', label: 'Resumo Semanal', type: 'table', selected: false }
];

export const CustomReportBuilder = ({ 
  selectedClient, 
  dateRange, 
  onGeneratePDF, 
  isGenerating 
}: CustomReportBuilderProps) => {
  const [reportTitle, setReportTitle] = useState('Relatório Personalizado');
  const [reportDescription, setReportDescription] = useState('');
  const [fields, setFields] = useState<ReportField[]>(availableFields);
  const [filters, setFilters] = useState<CustomFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string>('day');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const { data: financialMetrics } = useFinancialMetrics();
  const { data: clients } = useClients();

  const handleFieldToggle = (fieldId: string) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, selected: !field.selected } : field
    ));
  };

  const addFilter = () => {
    const newFilter: CustomFilter = {
      id: Date.now().toString(),
      field: 'revenue',
      operator: 'greater_than',
      value: ''
    };
    setFilters(prev => [...prev, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, key: keyof CustomFilter, value: string) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, [key]: value } : filter
    ));
  };

  const validateReport = () => {
    if (!reportTitle.trim()) {
      toast.error('Por favor, insira um título para o relatório');
      return false;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Por favor, selecione um período');
      return false;
    }

    const selectedFields = fields.filter(f => f.selected);
    if (selectedFields.length === 0) {
      toast.error('Por favor, selecione pelo menos um campo');
      return false;
    }

    return true;
  };

  const generateCustomReport = () => {
    if (!validateReport()) return;

    // Processar dados com base nas configurações
    let processedData = financialMetrics || [];

    // Aplicar filtros por cliente
    if (selectedClient && selectedClient !== 'all') {
      processedData = processedData.filter(m => m.client_id === selectedClient);
    }

    // Aplicar filtros de período
    if (dateRange?.from && dateRange?.to) {
      processedData = processedData.filter(m => {
        const metricDate = new Date(m.date);
        return metricDate >= dateRange.from && metricDate <= dateRange.to;
      });
    }

    // Aplicar filtros personalizados
    filters.forEach(filter => {
      if (!filter.value) return;
      
      processedData = processedData.filter(metric => {
        const fieldValue = (metric as any)[filter.field] || 0;
        const filterValue = parseFloat(filter.value);
        
        switch (filter.operator) {
          case 'greater_than':
            return fieldValue > filterValue;
          case 'less_than':
            return fieldValue < filterValue;
          case 'equals':
            return fieldValue === filterValue;
          case 'not_equals':
            return fieldValue !== filterValue;
          default:
            return true;
        }
      });
    });

    // Ordenar dados
    processedData.sort((a, b) => {
      const aValue = (a as any)[sortBy] || 0;
      const bValue = (b as any)[sortBy] || 0;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calcular métricas selecionadas
    const selectedFields = fields.filter(f => f.selected);
    const metrics: any = {};
    
    if (selectedFields.some(f => f.id === 'revenue')) {
      metrics.revenue = processedData.reduce((sum, m) => sum + (m.revenue || 0), 0);
    }
    
    if (selectedFields.some(f => f.id === 'orders')) {
      metrics.orders = processedData.reduce((sum, m) => sum + (m.orders_count || 0), 0);
    }
    
    if (selectedFields.some(f => f.id === 'average_ticket')) {
      metrics.averageTicket = metrics.orders > 0 ? metrics.revenue / metrics.orders : 0;
    }

    if (selectedFields.some(f => f.id === 'commission')) {
      metrics.commission = processedData.reduce((sum, m) => sum + (m.commission || 0), 0);
    }

    if (selectedFields.some(f => f.id === 'delivery_fee')) {
      metrics.deliveryFee = processedData.reduce((sum, m) => sum + (m.delivery_fee || 0), 0);
    }

    if (selectedFields.some(f => f.id === 'net_revenue')) {
      metrics.netRevenue = (metrics.revenue || 0) - (metrics.commission || 0) - (metrics.deliveryFee || 0);
    }

    const reportData = {
      title: reportTitle,
      description: reportDescription,
      client: selectedClient === 'all' ? 'Todas as lojas' : clients?.find(c => c.id === selectedClient)?.name,
      period: dateRange,
      fields: selectedFields,
      filters,
      metrics,
      rawData: processedData,
      config: {
        groupBy,
        sortBy,
        sortOrder
      },
      generatedAt: new Date().toISOString()
    };

    onGeneratePDF(reportData, reportTitle.replace(/\s+/g, '_'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Construtor de Relatórios</h2>
          <p className="text-muted-foreground">
            Crie relatórios personalizados com os dados que você precisa
          </p>
        </div>
        <Button onClick={generateCustomReport} disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Relatório</Label>
              <Input
                id="title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Ex: Análise de Performance Mensal"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Descreva o objetivo deste relatório..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Agrupar Por</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ordenar Por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="orders_count">Pedidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Ordem</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Decrescente</SelectItem>
                  <SelectItem value="asc">Crescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Campos Selecionáveis */}
        <Card>
          <CardHeader>
            <CardTitle>Campos do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={field.id}
                    checked={field.selected}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <label htmlFor={field.id} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {field.label}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Personalizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Filtros Personalizados
            <Button onClick={addFilter} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Filtro
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filters.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum filtro adicionado. Clique em "Adicionar Filtro" para começar.
            </p>
          ) : (
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, 'field', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Receita</SelectItem>
                      <SelectItem value="orders_count">Pedidos</SelectItem>
                      <SelectItem value="commission">Comissão</SelectItem>
                      <SelectItem value="delivery_fee">Taxa Entrega</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filter.operator} onValueChange={(value) => updateFilter(filter.id, 'operator', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater_than">Maior que</SelectItem>
                      <SelectItem value="less_than">Menor que</SelectItem>
                      <SelectItem value="equals">Igual a</SelectItem>
                      <SelectItem value="not_equals">Diferente de</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    placeholder="Valor"
                    className="w-32"
                  />

                  <Button
                    onClick={() => removeFilter(filter.id)}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Título:</strong> {reportTitle}</p>
            {reportDescription && <p><strong>Descrição:</strong> {reportDescription}</p>}
            <p><strong>Campos Selecionados:</strong> {fields.filter(f => f.selected).length}</p>
            <p><strong>Filtros:</strong> {filters.length}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {fields.filter(f => f.selected).map(field => (
                <Badge key={field.id} variant="secondary">
                  {field.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
