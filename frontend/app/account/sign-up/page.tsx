// app/account/sign-up/page.tsx
'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AuthInput, AuthShell, PrimaryAuthButton } from '@/components/auth/auth-shell';
import { customerApi, saveCustomerSession, type CustomerSession } from '@/lib/customer-api';

export default function CustomerSignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await customerApi<{ data: CustomerSession }>('/customer-auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, phone, code }),
      });
      saveCustomerSession(result.data);
      router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Set up your access"
      title="Your loan, always within reach."
      description="Create a secure account with the same email used in your loan application."
    >
      <form onSubmit={submit} className="space-y-5">
        <AuthInput
          label="Application email"
          required
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label="Application phone number"
          required
          type="tel"
          autoComplete="tel"
          placeholder="08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="space-y-2">
          <AuthInput
            label="Verification code"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <button
            type="button"
            className="text-sm font-bold text-[#1E7A34] hover:underline disabled:opacity-50"
            disabled={!phone || loading}
            onClick={async () => {
              setError('');
              try {
                await customerApi('/otp/request', { method: 'POST', body: JSON.stringify({ phone }) });
                setCodeSent(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to send verification code.');
              }
            }}
          >
            {codeSent ? 'Send code again' : 'Send verification code'}
          </button>
        </div>
        <AuthInput
          label="Create a password"
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthInput
          label="Confirm password"
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          placeholder="Enter it again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <PrimaryAuthButton disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Creating account…
            </>
          ) : (
            <>
              <CheckCircle2 size={17} /> Create my account
            </>
          )}
        </PrimaryAuthButton>
      </form>
      <p className="mt-7 text-sm text-[#625E55]">
        Already registered?{' '}
        <Link className="font-bold text-[#1E7A34] hover:underline" href="/account/sign-in">
          Sign in to your account
        </Link>
      </p>
    </AuthShell>
  );
}
