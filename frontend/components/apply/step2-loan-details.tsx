// components/apply/step2-loan-details.tsx
// FULL FILE — UPDATED: products fetched in parent now, passed as props; null-guard on Select

'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export function Step2LoanDetails({ formData, onChange, products, productsLoading, productsError }: Props) {
  const selectedProduct = products.find((p) => p.id === formData.loanProductId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Loan Details</h2>
        <p className="mt-2 text-muted-foreground">Tell us about the loan you need</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Loan Type</label>
          <Select value={formData.loanProductId} onValueChange={(value) => onChange('loanProductId', value ?? '')}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={productsLoading ? 'Loading products...' : 'Select loan type'} />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {productsError && <p className="mt-2 text-sm text-red-500">{productsError}</p>}
          {selectedProduct && (
            <p className="mt-2 text-xs text-muted-foreground">
              Amount: ₦{Number(selectedProduct.minimumAmount).toLocaleString()} – ₦{Number(selectedProduct.maximumAmount).toLocaleString()} · Max duration: {selectedProduct.maximumDuration} months
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Loan Amount</label>
          <Input type="number" value={formData.loanAmount} onChange={(e) => onChange('loanAmount', e.target.value)} placeholder="₦" className="mt-2" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Purpose</label>
          <Textarea value={formData.purpose} onChange={(e) => onChange('purpose', e.target.value)} placeholder="Describe the purpose of the loan" className="mt-2" rows={4} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Repayment Duration (months)</label>
          <Input type="number" value={formData.durationMonths} onChange={(e) => onChange('durationMonths', e.target.value)} placeholder="Number of months" className="mt-2" />
        </div>
      </div>
    </div>
  );
}