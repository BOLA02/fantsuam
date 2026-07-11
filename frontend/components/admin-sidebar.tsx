'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuItems } from '@/lib/nav-menu';

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      'border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col',
      open ? 'w-64' : 'w-20'
    )}>
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-2 font-bold text-lg overflow-hidden',
            !open && 'justify-center w-full'
          )}
        >
          <div className="relative flex-shrink-0 h-9 w-9">
            <Image
              src="/logo.png"
              alt="Fantsuam Foundation logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          {open && (
            <span className="hidden sm:inline whitespace-nowrap font-serif text-[15px] text-[#2E3192]">
              Fantsuam <span className="text-[#1E7A34]">Foundation</span>
            </span>
          )}
        </Link>
        {open && (
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 hover:bg-sidebar-accent/20 flex-shrink-0 text-muted-foreground"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {!open && (
        <div className="flex justify-center border-b border-sidebar-border py-2 text-muted-foreground">
          <button onClick={onToggle} className="rounded-lg p-1.5 hover:bg-sidebar-accent/20">
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Menu Links Map */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#2E3192] text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              title={open ? '' : item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
