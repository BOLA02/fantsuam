// components/apply/step2-loan-details.tsx
// FULL FILE — semantic tokens restored. Same props/behavior.

'use client';

import { Landmark, Wallet, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoanProduct } from '@/lib/api-types';
import { ApplyFormData } from './apply-types';
import { SectionHeader } from './section-header';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
  products: LoanProduct[];
  productsLoading: boolean;
  productsError: string | null;
}

const inputClass = 'h-9 text-sm text-foreground placeholder:text-muted-foreground/60';

function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon size={13} className="text-muted-foreground" />
      {children}
    </label>
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
    <div className="space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-lg font-bold">Loan Details</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Tell us about the loan you need</p>
      </div>

      <section>
        <SectionHeader icon={Landmark} title="Loan Product" />

        {productsLoading && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-[74px] animate-pulse rounded-lg border border-border bg-muted" />
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
                  className={`rounded-lg border px-3.5 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/60'
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
      </section>

      <section>
        <SectionHeader icon={Wallet} title="Amount & Duration" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel icon={Wallet}>Loan Amount</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
              <Input
                type="number"
                value={formData.loanAmount}
                onChange={(e) => onChange('loanAmount', e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-7 ${amountOutOfRange ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
            <FieldLabel icon={Clock}>Repayment Duration (months)</FieldLabel>
            <Input
              type="number"
              value={formData.durationMonths}
              onChange={(e) => onChange('durationMonths', e.target.value)}
              placeholder="e.g. 12"
              className={`${inputClass} ${durationOutOfRange ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {selectedProduct && (
              <p className={`mt-1.5 text-xs ${durationOutOfRange ? 'text-destructive' : 'text-muted-foreground'}`}>
                Max {selectedProduct.maximumDuration} months for this product
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={FileText} title="Purpose" />
        <Textarea
          value={formData.purpose}
          onChange={(e) => onChange('purpose', e.target.value)}
          placeholder="Describe the purpose of the loan"
          className="resize-none text-sm text-foreground placeholder:text-muted-foreground/60"
          rows={4}
        />
      </section>
    </div>
  );
}