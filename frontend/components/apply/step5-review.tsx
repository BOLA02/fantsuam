// components/apply/step5-review.tsx
// FULL FILE — semantic tokens restored. onEditStep optional, unchanged.
// Fix: added min-w-0 to grid/flex containers and wrap long values instead
// of letting them force the grid wider than the viewport (mobile overflow).

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
    <div className="min-w-0 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          <Icon size={15} className="shrink-0 text-primary" />
          <span className="truncate">{title}</span>
        </h3>
        {onEditStep && step && (
          <button
            type="button"
            onClick={() => onEditStep(step)}
            className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words text-foreground">{value}</p>
    </div>
  );
}

export function Step5Review({ formData, productName, uploadedCount, onEditStep }: Props) {
  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="hidden lg:block">
        <h2 className="text-lg font-bold">Review Your Application</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Your application has already been recorded — review the summary below</p>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <ReviewCard icon={User} title="Personal Information" step={1} onEditStep={onEditStep}>
          <div className="grid min-w-0 grid-cols-2 gap-2.5 text-sm">
            <Field label="Name" value={`${formData.firstName} ${formData.lastName}`} />
            <Field label="Phone" value={formData.phone} />
            <Field label="Email" value={formData.email || '—'} />
            <Field label="Monthly Income" value={`₦${Number(formData.monthlyIncome || 0).toLocaleString()}`} />
          </div>
        </ReviewCard>

        <ReviewCard icon={Landmark} title="Loan Details" step={2} onEditStep={onEditStep}>
          <div className="grid min-w-0 grid-cols-2 gap-2.5 text-sm">
            <Field label="Loan Type" value={productName || 'Not selected'} />
            <Field label="Amount" value={`₦${Number(formData.loanAmount || 0).toLocaleString()}`} />
            <div className="col-span-2 min-w-0">
              <Field label="Purpose" value={formData.purpose || '—'} />
            </div>
          </div>
        </ReviewCard>

        <ReviewCard icon={Users} title="Guarantor" step={3} onEditStep={onEditStep}>
          <div className="grid min-w-0 grid-cols-2 gap-2.5 text-sm">
            <Field label="Name" value={formData.guarantorName || '—'} />
            <Field label="Relationship" value={formData.guarantorRelationship || '—'} />
          </div>
        </ReviewCard>

        <ReviewCard icon={FileCheck2} title="Documents" step={4} onEditStep={onEditStep}>
          <p className="text-sm font-medium text-foreground">{uploadedCount} document(s) uploaded</p>
        </ReviewCard>
      </div>
    </div>
  );
}