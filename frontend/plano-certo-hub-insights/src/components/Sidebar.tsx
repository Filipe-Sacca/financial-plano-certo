import {
  LayoutDashboard,
  Receipt,
  Calendar,
  TrendingUp,
  CheckCircle,
  DollarSign,
  BarChart,
  CreditCard,
  RefreshCw,
  Clock,
  ArrowUpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const menuItems = [
    { id: 'financial-dashboard', label: 'Dashboard Financeiro', icon: LayoutDashboard },
    { id: 'settlements', label: 'Assentamentos', icon: DollarSign },
    { id: 'events', label: 'Eventos Financeiros', icon: Calendar },
    { id: 'sales', label: 'Vendas', icon: TrendingUp },
    { id: 'anticipations', label: 'Antecipações', icon: ArrowUpCircle },
    { id: 'reconciliation', label: 'Reconciliação', icon: CheckCircle },
    { id: 'ifood-sync', label: 'Sincronização iFood', icon: RefreshCw },
    { id: 'opening-hours', label: 'Horários de Funcionamento', icon: Clock },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              Plano Certo
            </h1>
            <p className="text-xs text-blue-500 font-semibold tracking-wide">
              MÓDULO FINANCEIRO
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeModule === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start items-center h-12 text-left px-4",
                activeModule === item.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => onModuleChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BarChart className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">Analytics Powered</span>
        </div>
        <div className="text-xs text-gray-500 text-center">
          © 2024 Plano Certo Financial
        </div>
      </div>
    </div>
  );
};