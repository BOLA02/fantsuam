'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasCustomerSession } from '@/lib/customer-api';
import { api } from '@/lib/api-routes';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (hasCustomerSession()) {
      router.replace('/account');
      return;
    }
    api.applicationFee
      .getConfig()
      .then((res) => router.replace(res.data?.enabled ? '/application-fee' : '/apply'))
      .catch(() => router.replace('/apply'));
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</main>;
}
