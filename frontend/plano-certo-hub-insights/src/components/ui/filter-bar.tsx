import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { Calendar, Users, Store } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useIfoodMerchants } from '@/hooks/merchants/useIfoodMerchants';
import { useAuth } from '@/App';

interface FilterBarProps {
  selectedClient?: string;
  onClientChange: (client: string) => void;
  selectedPeriod?: string;
  onPeriodChange: (period: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  showClientFilter?: boolean;
  showPeriodFilter?: boolean;
  className?: string;
}

export const FilterBar = ({
  selectedClient = 'all',
  onClientChange,
  selectedPeriod = '30d',
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  showClientFilter = true,
  showPeriodFilter = true,
  className = ''
}: FilterBarProps) => {
  const { data: clientsData } = useClients();
  const { user } = useAuth();
  const { data: merchantsData } = useIfoodMerchants(user?.id);
  
  const clients = [
    { value: 'all', label: 'Todos os Clientes' },
    ...(clientsData?.map(client => ({
      value: client.id,
      label: client.name,
      type: 'client'
    })) || []),
    ...(merchantsData?.map(merchant => ({
      value: merchant.merchant_id,
      label: merchant.name,
      type: 'merchant'
    })) || [])
  ];

  const periods = [
    { value: '1d', label: 'Hoje' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '180d', label: 'Últimos 6 meses' },
    { value: '365d', label: 'Último ano' },
    { value: 'custom', label: 'Período customizado' }
  ];

  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {showClientFilter && (
            <div className="flex items-center space-x-2 min-w-[200px]">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClient} onValueChange={onClientChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.value} value={client.value}>
                      {client.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showPeriodFilter && (
            <div className="flex items-center space-x-2 min-w-[200px]">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {selectedPeriod === 'custom' && onDateRangeChange ? (
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={onDateRangeChange}
                  className="w-full"
                />
              ) : (
                <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};