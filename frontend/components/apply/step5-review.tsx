// components/apply/step5-review.tsx

'use client';

import { ApplyFormData } from './apply-types';

interface Props {
  formData: ApplyFormData;
  productName: string;
  uploadedCount: number;
}

export function Step5Review({ formData, productName, uploadedCount }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review Your Application</h2>
        <p className="mt-2 text-muted-foreground">Your application has already been recorded — review the summary below</p>
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{formData.firstName} {formData.lastName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{formData.email || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{formData.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Income</p>
              <p className="font-medium text-foreground">₦{Number(formData.monthlyIncome || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-4">Loan Details</h3>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Loan Type</p>
              <p className="font-medium text-foreground">{productName || 'Not selected'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium text-foreground">₦{Number(formData.loanAmount || 0).toLocaleString()}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Purpose</p>
              <p className="font-medium text-foreground">{formData.purpose}</p>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-4">Guarantor</h3>
          <p className="text-sm text-foreground">{formData.guarantorName} · {formData.guarantorRelationship}</p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <h3 className="font-semibold text-foreground mb-4">Documents</h3>
          <p className="text-sm text-muted-foreground">{uploadedCount} document(s) uploaded</p>
        </div>
      </div>
    </div>
  );
}