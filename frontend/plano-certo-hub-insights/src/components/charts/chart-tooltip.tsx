
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const ChartTooltip = ({ children, content, ...props }: any) => {
  return (
    <Tooltip {...props}>
      {children && <TooltipTrigger asChild>{children}</TooltipTrigger>}
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};

export const ChartTooltipContent = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.dataKey}:
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
