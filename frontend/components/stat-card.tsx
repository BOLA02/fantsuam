import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-lg bg-card border border-border p-6 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
            {trendValue && (
              <span className={cn('text-sm font-medium', {
                'text-green-600': trend === 'up',
                'text-red-600': trend === 'down',
                'text-gray-500': trend === 'neutral',
              })}>
                {trend === 'up' && '↑ '}
                {trend === 'down' && '↓ '}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className="ml-4 rounded-lg bg-accent/10 p-3 text-accent">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
