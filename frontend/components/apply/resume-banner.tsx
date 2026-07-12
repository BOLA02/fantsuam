// components/apply/resume-banner.tsx
// NEW FILE

'use client';

import { X, RotateCcw } from 'lucide-react';

interface Props {
  firstName?: string;
  onContinue: () => void;
  onDismiss: () => void;
}

export function ResumeBanner({ firstName, onContinue, onDismiss }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <RotateCcw size={16} className="text-primary shrink-0" />
        <p className="text-sm text-foreground truncate">
          {firstName ? `Welcome back, ${firstName}! ` : 'Welcome back! '}
          You have an application in progress.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={onContinue} className="text-sm font-medium text-primary hover:underline">
          Continue
        </button>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}