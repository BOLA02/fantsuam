'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Bell, Search, User, LogOut } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title, showSearch = true, actions, className }: HeaderProps) {
  return (
    <header className={cn('border-b border-border bg-background px-6 py-4 sticky top-0 z-30', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
          {showSearch && (
            <div className="relative ml-auto hidden md:flex md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <button className="rounded-lg p-2 hover:bg-secondary transition-colors">
            <Bell className="h-5 w-5 text-foreground" />
          </button>
          <button className="rounded-lg p-2 hover:bg-secondary transition-colors">
            <User className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
