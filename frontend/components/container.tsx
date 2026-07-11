import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  sidebar?: boolean;
}

export function Container({ children, className, sidebar = false }: ContainerProps) {
  return (
    <div className={cn('min-h-screen bg-background', sidebar && 'ml-64')}>
      {children}
    </div>
  );
}
