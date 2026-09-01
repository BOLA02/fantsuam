// components/apply/step5-review.tsx
// FULL FILE — visual redesign pass, matches steps 1–4. onEditStep behavior unchanged.

'use client';

import { User, Landmark, Users, FileCheck2, Pencil } from 'lucide-react';
import { ApplyFormData } from './apply-types';

interface Props {
  formData: ApplyFormData;
  productName: string;
  uploadedCount: number;
  onEditStep?: (step: 1 | 2 | 3 | 4) => void;
}

function ReviewCard({
  icon: Icon,
  title,
  step,
  onEditStep,
  children,
}: {
  icon: React.ElementType;
  title: string;
  step?: 1 | 2 | 3 | 4;
  onEditStep?: (step: 1 | 2 | 3 | 4) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/80 bg-card p-4.5 shadow-sm">
      <div className="mb-3.5 flex min-w-0 items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2.5 text-[15px] font-semibold text-foreground">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon size={14} strokeWidth={2.25} />
          </span>
          <span className="truncate">{title}</span>
        </h3>
        {onEditStep && step && (
          <button
            type="button"
            onClick={() => onEditStep(step)}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`min-w-0 ${full ? 'col-span-2' : ''}`}>
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-[15px] font-medium text-foreground">{value}</p>
    </div>
  );
}

export function Step5Review({ formData, productName, uploadedCount, onEditStep }: Props) {
  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold text-foreground">Review your application</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your application has already been recorded — review the summary below
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <ReviewCard icon={User} title="Personal information" step={1} onEditStep={onEditStep}>
          <div className="grid min-w-0 grid-cols-2 gap-3.5">
            <Field label="Name" value={`${formData.firstName} ${formData.lastName}`} />
            <Field label="Phone" value={formData.phone} />
            <Field label="Email" value={formData.email || '—'} />
            <Field label="Monthly income" value={`₦${Number(formData.monthlyIncome || 0).toLocaleString()}`} />
          </div>
        </ReviewCard>

        <ReviewCard icon={Landmark} title="Loan details" step={2} onEditStep={onEditStep}>
          <div className="grid min-w-0 grid-cols-2 gap-3.5">
            <Field label="Loan type" value={productName || 'Not selected'} />
            <Field label="Amount" value={`₦${Number(formData.loanAmount || 0).toLocaleString()}`} />
            <Field label="Purpose" value={formData.purpose || '—'} full />
          </div>
        </ReviewCard>

        <ReviewCard icon={Users} title="Guarantor" step={3} onEditStep={onEditStep}>
          <div className="grid min-w-0 grid-cols-2 gap-3.5">
            <Field label="Name" value={formData.guarantorName || '—'} />
            <Field label="Relationship" value={formData.guarantorRelationship || '—'} />
          </div>
        </ReviewCard>

        <ReviewCard icon={FileCheck2} title="Documents" step={4} onEditStep={onEditStep}>
          <p className="text-[15px] font-medium text-foreground">
            {uploadedCount} document{uploadedCount === 1 ? '' : 's'} uploaded
          </p>
        </ReviewCard>
      </div>
    </div>
  );
}