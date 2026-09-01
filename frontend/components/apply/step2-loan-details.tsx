// components/apply/step2-loan-details.tsx
// FULL FILE — visual redesign pass, matches step1-personal-info. Same props/behavior as original.

'use client';

import { Landmark, Wallet, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoanProduct } from '@/lib/api-types';
import { ApplyFormData } from './apply-types';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
  products: LoanProduct[];
  productsLoading: boolean;
  productsError: string | null;
}

const inputClass =
  'h-11 text-[15px] text-foreground placeholder:text-muted-foreground/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[13px] font-medium text-foreground/70">{children}</label>;
}

function Section({
  icon: Icon,
  title,
  hint,
  first,
  children,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`${first ? '' : 'border-t border-border/60 pt-7'}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon size={14} strokeWidth={2.25} />
          </span>
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        </div>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="pl-9">{children}</div>
    </section>
  );
}

export function Step2LoanDetails({ formData, onChange, products, productsLoading, productsError }: Props) {
  const selectedProduct = products.find((p) => p.id === formData.loanProductId);
  const amount = Number(formData.loanAmount);
  const duration = Number(formData.durationMonths);

  const amountOutOfRange =
    !!selectedProduct && !!formData.loanAmount &&
    (amount < Number(selectedProduct.minimumAmount) || amount > Number(selectedProduct.maximumAmount));

  const durationOutOfRange =
    !!selectedProduct && !!formData.durationMonths && duration > selectedProduct.maximumDuration;

  return (
    <div className="space-y-7">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold text-foreground">Loan details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell us about the loan you need</p>
      </div>

      <Section icon={Landmark} title="Loan product" first>
        {productsLoading && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-[78px] animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        )}

        {productsError && <p className="text-xs text-destructive">{productsError}</p>}

        {!productsLoading && !productsError && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {products.map((product) => {
              const isSelected = product.id === formData.loanProductId;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onChange('loanProductId', product.id)}
                  aria-pressed={isSelected}
                  className={`rounded-lg border px-3.5 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:border-foreground/25 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{product.name}</span>
                    {isSelected && <CheckCircle2 size={16} className="shrink-0 text-primary" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ₦{Number(product.minimumAmount).toLocaleString()} – ₦{Number(product.maximumAmount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Up to {product.maximumDuration} months</p>
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <Section icon={Wallet} title="Amount & duration">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Loan amount</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground/70">₦</span>
              <Input
                type="number"
                value={formData.loanAmount}
                onChange={(e) => onChange('loanAmount', e.target.value)}
                placeholder="0.00"
                aria-invalid={amountOutOfRange}
                className={`${inputClass} pl-7 ${
                  amountOutOfRange ? 'border-destructive focus-visible:ring-destructive/40 focus-visible:border-destructive' : ''
                }`}
              />
            </div>
            {selectedProduct && (
              <p className={`mt-1.5 text-xs ${amountOutOfRange ? 'text-destructive' : 'text-muted-foreground'}`}>
                Allowed range: ₦{Number(selectedProduct.minimumAmount).toLocaleString()} – ₦
                {Number(selectedProduct.maximumAmount).toLocaleString()}
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Repayment duration (months)</FieldLabel>
            <div className="relative">
              <Clock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="number"
                value={formData.durationMonths}
                onChange={(e) => onChange('durationMonths', e.target.value)}
                placeholder="e.g. 12"
                aria-invalid={durationOutOfRange}
                className={`${inputClass} pl-9 ${
                  durationOutOfRange ? 'border-destructive focus-visible:ring-destructive/40 focus-visible:border-destructive' : ''
                }`}
              />
            </div>
            {selectedProduct && (
              <p className={`mt-1.5 text-xs ${durationOutOfRange ? 'text-destructive' : 'text-muted-foreground'}`}>
                Max {selectedProduct.maximumDuration} months for this product
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section icon={FileText} title="Purpose">
        <Textarea
          value={formData.purpose}
          onChange={(e) => onChange('purpose', e.target.value)}
          placeholder="Describe the purpose of the loan"
          className="resize-none border-border/80 bg-background text-[15px] text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50"
          rows={4}
        />
      </Section>
    </div>
  );
}