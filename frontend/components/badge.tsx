import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        {
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1.5 text-sm': size === 'md',
          'bg-secondary text-foreground': variant === 'default',
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-accent text-accent-foreground': variant === 'accent',
          'bg-destructive text-destructive': variant === 'destructive',
          'bg-muted text-muted-foreground': variant === 'secondary',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
