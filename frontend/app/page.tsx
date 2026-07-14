'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasCustomerSession } from '@/lib/customer-api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasCustomerSession() ? '/account' : '/apply');
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</main>;
}
