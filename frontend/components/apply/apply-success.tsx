// components/apply/apply-success.tsx
// FULL FILE — visual pass only. Same copy-to-clipboard logic as original.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Copy, Check, MessageSquareText, ClipboardCheck, Banknote, ArrowRight, LogIn } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-[#F8F6F0]">
      <nav className="border-b border-[#E6E0D3] bg-white">
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

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 ring-4 ring-secondary/10">
              <CheckCircle2 size={32} className="text-secondary" />
            </div>
          </div>

          <p className="text-center text-xs font-bold uppercase tracking-[0.17em] text-[#1E7A34]">Application received</p>
          <h1 className="mt-2 text-center font-serif text-3xl font-bold text-[#2E3192]">You’re one step closer.</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your application has been received and is now under review.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Application Number
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="truncate font-mono text-xl font-semibold text-foreground">{applicationNumber}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
              >
                {copied ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Keep this number to track your application status.</p>
          </div>

          <div className="mt-7 space-y-3.5">
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

          <div className="mt-8 rounded-2xl border border-[#D8E7C7] bg-[#F3F9EC] p-4">
            <p className="font-semibold text-[#2E3192]">Track every step online</p>
            <p className="mt-1 text-sm leading-5 text-[#625E55]">Set up your account now to follow your application and, once approved, every repayment.</p>
            <Button asChild className="mt-4 w-full bg-[#2E3192] hover:bg-[#23256F]">
              <Link href="/account/sign-up">Set up my online account <ArrowRight size={16} /></Link>
            </Button>
          </div>
          <Link href="/account/sign-in" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2E3192]/20 bg-white px-4 py-3 text-sm font-bold text-[#2E3192] transition hover:border-[#2E3192] hover:bg-[#F6F6FF]"><LogIn size={16} /> Already applied? Sign in to your account</Link>
        </div>
      </div>
    </div>
  );
}
