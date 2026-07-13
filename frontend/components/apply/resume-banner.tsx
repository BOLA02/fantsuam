// components/apply/resume-banner.tsx
// FULL FILE — now a fixed-position toast instead of an inline banner, so it
// stays visible regardless of scroll position. Same onContinue/onDismiss
// behavior as before; no auto-dismiss, since this needs an explicit choice.

'use client';

import { X, RotateCcw } from 'lucide-react';

interface Props {
  firstName?: string;
  onContinue: () => void;
  onDismiss: () => void;
}

export function ResumeBanner({ firstName, onContinue, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="fixed inset-x-3 top-3 z-[60] mx-auto flex w-auto max-w-md animate-in fade-in-0 slide-in-from-top-4 items-start gap-3 rounded-lg border border-primary/30 bg-card px-4 py-3 shadow-lg duration-300 sm:inset-x-auto sm:right-4 sm:left-auto"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <RotateCcw size={14} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm text-foreground">
          {firstName ? `Welcome back, ${firstName}! ` : 'Welcome back! '}
          You have an application in progress.
        </p>
        <button
          onClick={onContinue}
          className="mt-1 text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          Continue where you left off
        </button>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X size={15} />
      </button>
    </div>
  );
}