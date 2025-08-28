
import { Menu, Bell, User, Calendar, Users, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useClients } from '@/hooks/useClients';
import { useIfoodMerchants } from '@/hooks/useIfoodMerchants';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
  selectedClient?: string;
  onClientChange: (client: string) => void;
  selectedPeriod?: string;
  onPeriodChange: (period: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export const Header = ({ 
  onMenuClick, 
  isMobile, 
  selectedClient = 'all',
  onClientChange,
  selectedPeriod = '30d',
  onPeriodChange,
  dateRange,
  onDateRangeChange
}: HeaderProps) => {
  const { data: clientsData } = useClients();
  const { user } = useAuth();
  const { data: merchantsData } = useIfoodMerchants(user?.id);
  const { theme, toggleTheme } = useTheme();
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (user) {
      console.log('🔍 [DEBUG Header] User data:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      });
      
      // Tentar buscar na tabela profiles, mas não depender dela
      const fetchProfile = async () => {
        try {
          console.log('🔍 [DEBUG Header] Tentando buscar profile...');
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('nome')
            .eq('id', user.id)
            .maybeSingle();
          
          console.log('👤 [DEBUG Header] Resultado profiles:', { profile, error });
          
          if (profile?.nome) {
            console.log('✅ [DEBUG Header] Profile encontrado:', profile.nome);
            setProfileName(profile.nome);
          } else {
            // Se não conseguir buscar na profiles, usar dados do Auth diretamente
            console.log('📝 [DEBUG Header] Usando dados do Auth diretamente');
            const fallbackName = user.user_metadata?.nome || 
                                user.user_metadata?.name || 
                                user.email?.split('@')[0] || 
                                'Usuário';
            setProfileName(fallbackName);
          }
        } catch (error) {
          console.error('❌ [DEBUG Header] Erro ao buscar profile:', error);
          // Fallback: usar dados do Auth
          const fallbackName = user.user_metadata?.nome || 
                              user.user_metadata?.name || 
                              user.email?.split('@')[0] || 
                              'Usuário';
          setProfileName(fallbackName);
        }
      };
      
      fetchProfile();
    }
  }, [user]);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <style>{`
        .logo-container * {
          border: none !important;
          border-bottom: none !important;
          text-decoration: none !important;
        }
        .logo-container *::before,
        .logo-container *::after {
          display: none !important;
        }
      `}</style>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {/* Logomarca da Plano Certo Delivery */}
                     <div className="logo-container flex items-center space-x-3 border-0 outline-0" style={{ border: 'none', textDecoration: 'none' }}>
             <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 border-0 outline-0" style={{ boxShadow: 'none', border: 'none' }}>
               <span className="text-white font-bold text-lg select-none" style={{ border: 'none', textDecoration: 'none', outline: 'none', boxShadow: 'none' }}>PC</span>
             </div>
            <div className="flex flex-col border-0 outline-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight no-underline border-0 outline-0 decoration-0" style={{ textDecoration: 'none', border: 'none', borderBottom: 'none' }}>
                Plano Certo
              </h1>
              <p className="text-xs text-orange-500 font-semibold tracking-wide leading-none no-underline border-0 outline-0 decoration-0" style={{ textDecoration: 'none', border: 'none', borderBottom: 'none' }}>
                DELIVERY HUB
              </p>
            </div>
          </div>
        </div>
        {/* Filtros Globais */}
        {!isMobile && (
          <>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <Select value={selectedClient} onValueChange={onClientChange}>
                <SelectTrigger className="w-48">
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
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              {selectedPeriod === 'custom' && onDateRangeChange ? (
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={onDateRangeChange}
                  className="w-64"
                />
              ) : (
                <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                  <SelectTrigger className="w-40">
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
          </>
        )}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="relative"
            title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="font-medium text-gray-700 max-w-[120px] truncate">{profileName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/auth';
              }}>
                Desconectar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
