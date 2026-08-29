'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { captureSsoTokenFromUrl, validateSession, redirectToConsole } from '@/lib/sso';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authState, setAuthState] = useState<'checking' | 'authenticated'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      captureSsoTokenFromUrl();
      const valid = await validateSession();

      if (cancelled) return;

      if (!valid) {
        redirectToConsole();
        return;
      }

      setAuthState('authenticated');
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Verifying session…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto bg-[#FAF6EC]/40 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}