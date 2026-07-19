'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-routes';

export default function VerifyApplicationFeePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  useEffect(() => {
    const reference = params.get('reference');
    if (!reference) { setError('Payment reference is missing.'); return; }
    api.applicationFee.verify(reference)
      .then((res) => { localStorage.setItem('mf_application_fee_token', res.data.token); router.replace('/apply'); })
      .catch((err) => setError(err.message || 'We could not verify this payment.'));
  }, [params, router]);
  return <main className="grid min-h-screen place-items-center p-4 text-center"><div>{error ? <p className="text-destructive">{error}</p> : <><Loader2 className="mx-auto animate-spin" /><p className="mt-3 text-sm text-muted-foreground">Verifying your Paystack payment…</p></>}</div></main>;
}
