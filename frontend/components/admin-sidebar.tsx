'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuItems } from '@/lib/nav-menu';
import { useAuth } from '@/lib/auth-context';

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const auth = useAuth() as ReturnType<typeof useAuth> & { logout?: () => void };
  const { hasPermission } = auth;

  const visibleItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#14201A] text-[#D8DED9] transition-all duration-300',
        open ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-2.5 overflow-hidden',
            !open && 'justify-center w-full'
          )}
        >
          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-white/5">
            <Image
              src="/logo.png"
              alt="Fantsuam Foundation logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          {open && (
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span className="font-semibold text-[15px] text-white">Fantsuam</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#8FA095]">
                Admin Console
              </span>
            </div>
          )}
        </Link>
        {open && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 rounded-lg p-1.5 text-[#8FA095] hover:bg-white/10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {!open && (
        <div className="flex justify-center border-b border-white/10 py-2">
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-[#8FA095] hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Menu Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {open && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#5E7168]">
            Overview
          </p>
        )}
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#EDEFE6] text-[#14201A] shadow-sm'
                  : 'text-[#B7C2B9] hover:bg-white/10 hover:text-white',
                !open && 'justify-center'
              )}
              title={open ? '' : item.label}
            >
              <span
                className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                  isActive ? 'bg-[#14201A]/10' : 'bg-white/5'
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
              </span>
              {open && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={() => auth.logout?.()}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#E08A8A] hover:bg-white/10',
            !open && 'justify-center'
          )}
          title={open ? '' : 'Sign out'}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {open && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
