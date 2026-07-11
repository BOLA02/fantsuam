'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface SidebarProps {
  logo?: ReactNode;
  items: NavItem[];
  footer?: ReactNode;
  className?: string;
}

export function Sidebar({ logo, items, footer, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-primary text-primary-foreground overflow-y-auto', className)}>
      {/* Logo */}
      {logo && <div className="border-b border-sidebar-border px-6 py-4">{logo}</div>}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {item.badge !== undefined && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && <div className="border-t border-sidebar-border p-3">{footer}</div>}
    </aside>
  );
}
