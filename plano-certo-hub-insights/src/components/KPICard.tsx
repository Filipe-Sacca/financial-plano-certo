
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color,
  delay = 0 
}: KPICardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? "text-green-600" : "text-red-600"
              )}>
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs. mês anterior
              </span>
            </div>
          </div>
          <div className={cn(
            "p-2 rounded-lg bg-gray-50",
            color
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
