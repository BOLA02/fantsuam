'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, Settings, LogOut, ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-types';

interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
}

// One row returned by the global search endpoint.
// Adjust this shape to match whatever /search/global actually returns.
interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  category: string; // e.g. 'Users' | 'Orders' | 'Products'
}

interface GlobalSearchResponse {
  results: GlobalSearchResult[];
}

function groupByCategory(results: GlobalSearchResult[]) {
  return results.reduce<Record<string, GlobalSearchResult[]>>((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});
}

export function AdminHeader() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initials, setInitials] = useState('AD');

  // ---- Global search state ----
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await apiClient<ApiResponse<GlobalSearchResponse>>(
        `/search/global?q=${encodeURIComponent(q)}`,
        { signal: controller.signal }
      );
      const data = response.data?.results || [];
      setResults(data);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Global search failed:', err);
        setSearchError('Search failed. Try again.');
        setResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSearchOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchError(null);
    setSearchOpen(false);
  };

  const handleResultClick = (result: GlobalSearchResult) => {
    setSearchOpen(false);
    router.push(result.url);
  };

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
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

  const grouped = groupByCategory(results);
  const hasResults = results.length > 0;

  return (
    <header className="border-b border-border bg-card sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search Group */}
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/60 border border-transparent focus-within:border-border transition-colors">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => query && setSearchOpen(true)}
                placeholder="Search everything…"
                className="bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground flex-1 min-w-0"
              />
              {searchLoading && (
                <Loader2 size={16} className="animate-spin text-muted-foreground shrink-0" />
              )}
              {!searchLoading && query && (
                <button
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results dropdown */}
            {searchOpen && query && (
              <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg z-40">
                {searchLoading && !hasResults && (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    Searching…
                  </div>
                )}

                {searchError && (
                  <div className="px-4 py-6 text-sm text-red-600 text-center">
                    {searchError}
                  </div>
                )}

                {!searchLoading && !searchError && !hasResults && (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                )}

                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="py-1">
                    <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {category}
                    </p>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm text-foreground font-medium">{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
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