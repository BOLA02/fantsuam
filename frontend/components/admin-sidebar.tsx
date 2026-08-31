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
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          'flex h-screen flex-col overflow-hidden bg-white text-[#3A3A34] transition-all duration-300',
          'fixed inset-y-0 left-0 z-50 w-64',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:static md:translate-x-0 md:z-auto md:shadow-none',
          open ? 'md:w-64' : 'md:w-20',
          'shadow-xl'
        )}
      >
        {/* Brand Header — no border, blends straight into the sidebar */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-2.5 overflow-hidden',
              !open && 'md:justify-center md:w-full'
            )}
          >
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md">
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
                <span className="font-display font-semibold text-[15px] text-[#2c2a7a]">
                  Fantsuam
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#8A8677]">
                  Admin Console
                </span>
              </div>
            )}
          </Link>
          {open && (
            <button
              onClick={onToggle}
              className="flex-shrink-0 rounded-lg p-1.5 text-[#8A8677] hover:bg-[#F5F5F3]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {!open && (
          <div className="hidden flex-shrink-0 justify-center py-2 md:flex">
            <button
              onClick={onToggle}
              className="rounded-lg p-1.5 text-[#8A8677] hover:bg-[#F5F5F3]"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {/* Menu Links — min-h-0 lets this scroll internally instead of the sidebar growing past the viewport */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto scrollbar-hide px-3 py-4">
          {open && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#B0AC9C]">
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
                onClick={() => {
                  if (window.innerWidth < 768 && open) onToggle();
                }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#2c2a7a]/10 text-[#2c2a7a]'
                    : 'text-[#5C5849] hover:bg-[#F5F5F3] hover:text-[#2b2b28]',
                  !open && 'md:justify-center'
                )}
                title={open ? '' : item.label}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                    isActive ? 'bg-[#2c2a7a]/10' : 'bg-[#F5F5F3]'
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                </span>
                {open && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        
      </aside>
    </>
  );
}