'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasCustomerSession } from '@/lib/customer-api';

export default function CustomerAccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const [ready, setReady] = useState(false);
  useEffect(() => { if (!hasCustomerSession()) router.replace(`/account/sign-in?next=${encodeURIComponent(pathname)}`); else setReady(true); }, [pathname, router]);
  return ready ? <>{children}</> : <main className="grid min-h-screen place-items-center text-sm text-slate-600">Checking your account…</main>;
}
