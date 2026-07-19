'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  Loader2,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ChevronDown,
  BadgeCheck,
  CircleCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';

const FEE_INCLUDES = [
  'Application processing & underwriting review',
  'Identity and document verification',
  'Credit decision within 24–48 hours',
];

export default function ApplicationFeePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    api.applicationFee.getConfig()
      .then((res) => {
        if (!res.data?.enabled) router.replace('/apply');
        else setAmount(res.data.amount);
      })
      .catch(() => setError('We could not load the application fee. Please refresh and try again.'))
      .finally(() => setLoading(false));
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await api.applicationFee.initialize(email);
      window.location.assign(response.data.authorizationUrl);
    } catch (err: any) {
      setError(err.message || 'Could not start your payment. Please try again.');
      setSubmitting(false);
    }
  }

  const formattedAmount =
    amount === null ? '' : `₦${(amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen max-w-5xl grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT — context & trust panel */}
        <div className="hidden flex-col justify-between border-r border-border bg-card px-10 py-12 lg:flex">
          <div>
            <button
              onClick={() => router.push('/apply')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft size={15} />
              Back to application
            </button>

            {/* Step indicator */}
            <div className="mt-10 flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      step < 3
                        ? 'bg-primary/15 text-primary'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {step < 3 ? <CircleCheck size={14} /> : step}
                  </div>
                  {step < 3 && <div className="h-px w-6 bg-border" />}
                </div>
              ))}
              <span className="ml-2 text-xs font-medium text-muted-foreground">Step 3 of 3 · Payment</span>
            </div>

            <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight">
              You're almost done.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A one-time application fee is required to submit your loan request for review. This covers
              underwriting and verification so we can get you a decision fast.
            </p>

            <div className="mt-8 space-y-3">
              {FEE_INCLUDES.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <CircleCheck size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust footer */}
          <div className="mt-10 border-t border-border pt-6">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Lock size={13} />
              256-bit encrypted checkout
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
              Payments are processed securely by Paystack. We never see or store your card details.
            </p>
            <div className="mt-4 flex items-center gap-3 opacity-70">
              <BadgeCheck size={16} className="text-muted-foreground" />
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                PCI-DSS COMPLIANT
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — payment form */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <form onSubmit={submit} className="w-full max-w-sm">
            {/* Mobile-only back + step */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => router.push('/apply')}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <span className="text-xs font-medium text-muted-foreground">Step 3 of 3</span>
            </div>

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>

            <h2 className="text-xl font-semibold">Application fee</h2>
            <p className="mt-1.5 text-sm text-muted-foreground lg:hidden">
              Pay to submit your application for review.
            </p>

            {/* Amount card */}
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
              <div className="p-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount due
                </p>
                {loading ? (
                  <div className="mx-auto mt-2 h-9 w-32 animate-pulse rounded-md bg-muted" />
                ) : (
                  <p className="mt-1 text-3xl font-bold tabular-nums">{formattedAmount}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">One-time, non-recurring charge</p>
              </div>

              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex w-full items-center justify-between border-t border-border px-5 py-3 text-xs font-medium text-muted-foreground transition hover:bg-muted/50"
              >
                What's this for?
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showBreakdown && (
                <div className="space-y-2 border-t border-border bg-muted/30 px-5 py-4">
                  {FEE_INCLUDES.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-foreground/75">
                      <CircleCheck size={13} className="mt-0.5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email field */}
            <div className="mt-6">
              <label htmlFor="email" className="block text-sm font-medium">
                Email for your receipt
              </label>
              <Input
                id="email"
                className="mt-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                We'll send your payment confirmation here.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              className="mt-6 w-full"
              size="lg"
              type="submit"
              disabled={loading || submitting || !amount || !emailValid}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Redirecting to Paystack…
                </>
              ) : (
                <>Pay {formattedAmount || ''} securely</>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock size={12} />
              Secured by Paystack · Encrypted checkout
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}