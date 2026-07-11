import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  status?: 'completed' | 'pending' | 'current';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 border-border', {
              'bg-accent text-accent-foreground': item.status === 'completed' || item.status === 'current',
              'bg-card': item.status === 'pending',
            })}>
              {item.icon ? item.icon : <div className="h-3 w-3 rounded-full bg-current" />}
            </div>
            {index < items.length - 1 && (
              <div className="absolute top-12 h-8 w-0.5 bg-border" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
