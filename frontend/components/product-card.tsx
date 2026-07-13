'use client';

import { Pencil, Trash2, Percent, CalendarClock, ShieldCheck, Fingerprint, Users } from 'lucide-react';
import { LoanProduct } from '@/lib/api-types';

interface ProductCardProps {
  product: LoanProduct;
  onEdit: (product: LoanProduct) => void;
  onDelete: (id: string) => void;
}

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BI_WEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
};

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const requirementBadges = [
    product.requiresGuarantor && { label: 'Guarantor', icon: Users },
    product.requiresBVN && { label: 'BVN', icon: Fingerprint },
    product.requiresNIN && { label: 'NIN', icon: ShieldCheck },
  ].filter(Boolean) as { label: string; icon: typeof Users }[];

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-foreground/15">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">{product.name}</h3>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{product.productCode}</p>
        </div>

        <span
          className={
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ' +
            (product.isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-secondary text-muted-foreground')
          }
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {product.description && (
        <p className="line-clamp-2 px-5 text-sm text-muted-foreground">{product.description}</p>
      )}

      {/* Loan amount — the headline figure */}
      <div className="mx-5 mt-4 rounded-lg bg-secondary/40 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Loan Amount</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {currency.format(product.minimumAmount)}
          <span className="mx-1.5 font-normal text-muted-foreground">–</span>
          {currency.format(product.maximumAmount)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-5 pt-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Percent size={12} /> Interest
          </span>
          <span className="font-medium text-foreground">{product.interestRate}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock size={12} /> Duration
          </span>
          <span className="font-medium text-foreground">{product.maximumDuration}mo</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Repayment</span>
          <span className="font-medium text-foreground">
            {FREQUENCY_LABEL[product.repaymentFrequency] ?? product.repaymentFrequency}
          </span>
        </div>
      </div>

      {/* Fees, penalty */}
      <div className="mt-4 flex items-center gap-4 border-t border-border px-5 pt-3 text-xs text-muted-foreground">
        <span>Processing fee: <span className="text-foreground font-medium">{currency.format(product.processingFee)}</span></span>
        <span>Penalty: <span className="text-foreground font-medium">{product.penaltyRate}%</span></span>
      </div>

      {/* Requirements */}
      {requirementBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {requirementBadges.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
            >
              <Icon size={11} />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-1 border-t border-border px-3 py-2">
        <button
          onClick={() => onEdit(product)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}