'use client';

import { useState } from 'react';
// 👇 IMPORT THE REFACTORED SUB-COMPONENTS
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* 🚀 1. Modular Sidebar Component */}
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Structural Wrapper Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 🚀 2. Modular Header Toolbar Component */}
        <AdminHeader />

        {/* Dynamic Nested Sub-Route Page Injection Space Slot */}
        <main className="flex-1 overflow-y-auto bg-[#FAF6EC]/40 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
