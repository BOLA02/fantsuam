// components/apply/apply-success.tsx
// FULL FILE — semantic tokens restored.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Copy, Check, MessageSquareText, ClipboardCheck, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  applicationNumber: string;
}

const NEXT_STEPS = [
  { icon: ClipboardCheck, text: 'Our team reviews your application and documents' },
  { icon: MessageSquareText, text: "You'll receive an SMS update on your application status" },
  { icon: Banknote, text: 'Approved funds are disbursed to your provided account' },
];

export function ApplySuccess({ applicationNumber }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(applicationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-9 shrink-0">
                <Image src="/logo.png" alt="MicroFinance logo" fill className="object-contain" priority />
              </div>
              <span className="hidden font-semibold text-foreground sm:inline">MicroFinance</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
              <CheckCircle2 size={32} className="text-secondary" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold">Application Submitted</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your application has been received and is now under review.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Application Number
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="truncate font-mono text-xl font-semibold text-foreground">{applicationNumber}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {copied ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Keep this number to track your application status.</p>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">What happens next</p>
            {NEXT_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon size={14} />
                </div>
                <p className="pt-1 text-sm text-foreground/80">{step.text}</p>
              </div>
            ))}
          </div>

          <Button asChild variant="outline" className="mt-8 w-full">
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}