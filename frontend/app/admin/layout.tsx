// app/admin/layout.tsx
'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { useAuth } from '@/lib/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth(); // AuthProvider is the ONLY thing that captures/validates

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Verifying session…</p>
      </div>
    );
  }

  if (!user) return null; // AuthProvider already triggers redirectToConsole()

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar open={true} onToggle={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-[#FAF6EC]/40 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}