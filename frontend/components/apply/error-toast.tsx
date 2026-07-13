// components/apply/error-toast.tsx
// NEW FILE — fixed-position toast so errors are visible regardless of
// scroll position. Auto-dismisses after 6s, or can be closed manually.

'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
    // Re-arm the timer whenever the message changes so a new error
    // (even with identical text) gets its own full 6s window.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <div
      role="alert"
      className="fixed inset-x-3 top-3 z-[60] mx-auto flex w-auto max-w-md animate-in fade-in-0 slide-in-from-top-4 items-start gap-3 rounded-lg border border-destructive/30 bg-card px-4 py-3 shadow-lg duration-300 sm:inset-x-auto sm:right-4 sm:left-auto"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle size={14} />
      </div>
      <p className="min-w-0 flex-1 pt-1 text-sm text-foreground">{message}</p>
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