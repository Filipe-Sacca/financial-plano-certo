
import React from 'react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  config: Record<string, { label: string; color: string }>;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer = ({ config, children, className }: ChartContainerProps) => {
  return (
    <div 
      className={cn("chart-container", className)}
      style={{
        '--color-revenue': config.revenue?.color || 'hsl(var(--chart-1))',
        '--color-netRevenue': config.netRevenue?.color || 'hsl(var(--chart-2))',
        '--color-orders': config.orders?.color || 'hsl(var(--chart-3))',
        '--color-averageTicket': config.averageTicket?.color || 'hsl(var(--chart-4))',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
