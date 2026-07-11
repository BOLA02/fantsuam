'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loanProducts } from '@/lib/mock-data';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                MF
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">MicroFinance</span>
            </Link>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/apply">Apply Now</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-primary/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground">Our Loan Products</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the perfect loan product for your needs
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {loanProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>

                <div className="mt-6 space-y-3 flex-1">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Maximum Amount</p>
                    <p className="text-lg font-semibold text-foreground">
                      ₦{(product.maxAmount / 1000).toFixed(0)}K
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="text-lg font-semibold text-accent">{product.interestRate}% p.a</p>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm text-foreground">
                      {product.minDuration} - {product.maxDuration} months
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-2 border-t border-border pt-6">
                  <p className="text-xs font-semibold text-foreground uppercase">Requirements</p>
                  <ul className="space-y-2">
                    {product.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={16} className="text-accent flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild className="mt-6 w-full bg-primary hover:bg-primary/90">
                  <Link href="/apply">
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Have questions? <a href="mailto:support@microfinance.com" className="text-accent hover:underline">Contact our support team</a>
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              © 2026 MicroFinance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
