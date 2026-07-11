'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-types';

interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
}

export function AdminHeader() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initials, setInitials] = useState('AD');

  useEffect(() => {
    async function fetchActiveUser() {
      try {
        const response = await apiClient<ApiResponse<any>>('/auth/me');
        const userData = response.data?.user || response.data;
        
        if (userData) {
          setProfile({
            firstName: userData.firstName || 'Admin',
            lastName: userData.lastName || 'User',
            role: userData.role ? userData.role.replace('_', ' ') : 'Staff',
          });

          const fChar = userData.firstName?.[0] || 'A';
          const lChar = userData.lastName?.[0] || 'D';
          setInitials(`${fChar}${lChar}`.toUpperCase());
        }
      } catch (err) {
        console.error('Failed to parse profile context:', err);
      }
    }

    fetchActiveUser();

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
    router.push('/auth/login');
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search Group */}
        <div className="flex-1 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 flex-1 max-w-md">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground flex-1"
            />
          </div>
        </div>

        {/* Notifications and Profile */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Popover Controls */}
          <div className="relative pl-4 border-l border-border" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E7A34] text-white text-sm font-bold shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block text-sm text-left">
                <p className="font-semibold text-foreground">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'Syncing Profile…'}
                </p>
                <p className="text-xs font-medium capitalize text-muted-foreground">
                  {profile ? profile.role.toLowerCase() : 'Please Wait'}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={cn('text-muted-foreground transition-transform hidden sm:block', userMenuOpen && 'rotate-180')}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg py-1 z-40">
                <div className="px-4 py-3 border-b border-border sm:hidden">
                  <p className="font-medium text-foreground text-sm">
                    {profile ? `${profile.firstName} ${profile.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {profile ? profile.role : 'Super Admin'}
                  </p>
                </div>
                <Link
                  href="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Settings size={16} />
                  Settings Control
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors text-left font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
