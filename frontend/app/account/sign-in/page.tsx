// app/account/sign-in/page.tsx
'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';
import { AuthInput, AuthShell, PrimaryAuthButton } from '@/components/auth/auth-shell';
import { customerApi, saveCustomerSession, type CustomerSession } from '@/lib/customer-api';

export default function CustomerSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await customerApi<{ data: CustomerSession }>('/customer-auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveCustomerSession(result.data);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next?.startsWith('/account') ? next : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Member access"
      title="Welcome back."
      description="Sign in to follow your loan application, repayment plan and payment history."
    >
      <form onSubmit={submit} className="space-y-5">
        <AuthInput
          label="Email address"
          required
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label="Password"
          required
          minLength={8}
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <PrimaryAuthButton disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <LogIn size={17} /> Sign in securely
            </>
          )}
        </PrimaryAuthButton>
      </form>
      <div className="mt-7 rounded-2xl border border-[#E4DDD0] bg-[#FCFAF5] p-4 text-sm text-[#625E55]">
        First time here?{' '}
        <Link className="font-bold text-[#1E7A34] hover:underline" href="/account/sign-up">
          Create your online account
        </Link>
      </div>
    </AuthShell>
  );
}