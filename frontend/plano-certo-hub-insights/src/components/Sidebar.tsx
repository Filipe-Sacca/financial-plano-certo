
import { 
  Utensils,
  Settings,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const menuItems = [
    { id: 'menu-management', label: 'Gestão Menu', icon: Utensils },
    { id: 'ifood-api', label: 'API iFood', icon: Settings },
    { id: 'store-monitoring', label: 'Monitoramento', icon: Activity },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <div className="text-white font-bold text-lg">PC</div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Plano Certo
            </h1>
            <p className="text-xs text-orange-500 font-semibold tracking-wide">
              DELIVERY HUB
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
                "w-full justify-start h-12 text-left",
                activeModule === item.id 
                  ? "bg-orange-500 text-white hover:bg-orange-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              onClick={() => onModuleChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Plano Certo Delivery
        </div>
      </div>
    </div>
  );
};
