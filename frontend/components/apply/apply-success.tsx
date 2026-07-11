// components/apply/apply-success.tsx

'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  applicationNumber: string;
}

export function ApplySuccess({ applicationNumber }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                MF
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">MicroFinance</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle size={48} className="text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-muted-foreground mb-2">
            Your application has been received and is under review.
          </p>
          <div className="bg-card border border-border rounded-lg p-6 my-6">
            <p className="text-sm text-muted-foreground mb-2">Application Number</p>
            <p className="text-2xl font-semibold text-foreground font-mono">
              {applicationNumber}
            </p>
          </div>
          <p className="text-muted-foreground mb-8">
            You will receive an SMS shortly with more details about your application status. You can track your application using the application number above.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}