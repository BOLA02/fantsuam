'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  LoanProduct,
  RepaymentFrequency,
  LoanProductFee,
  LoanProductRequirement,
} from '@/lib/api-types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingProduct: LoanProduct | null;
}

const REPAYMENT_FREQUENCIES: RepaymentFrequency[] = ['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY'];

// Fee rows keep `amount` as a string while being edited, for the same reason
// the top-level amount fields do (see FormData below).
type FeeRow = Omit<LoanProductFee, 'id' | 'amount'> & { amount: string };
type RequirementRow = Omit<LoanProductRequirement, 'id'>;

// NOTE: the numeric-looking fields below are intentionally strings.
// Binding a <input type="number"> directly to a `number` state value and
// parsing on every keystroke (Number(e.target.value)) breaks typing:
// clearing the field snaps back to 0, and decimals/leading zeros get
// stripped mid-type because the parsed value re-renders the input.
// Keeping the raw string lets the user type freely; we parse to numbers
// only for validation and at submit time.
interface ProductFormData {
  productCode: string;
  name: string;
  description: string;
  minimumAmount: string;
  maximumAmount: string;
  interestRate: string;
  processingFee: string;
  penaltyRate: string;
  maximumDuration: string;
  repaymentFrequency: RepaymentFrequency;
  requiresGuarantor: boolean;
  requiresBVN: boolean;
  requiresNIN: boolean;
  fees: FeeRow[];
  requirements: RequirementRow[];
}

const emptyFormData: ProductFormData = {
  productCode: '',
  name: '',
  description: '',
  minimumAmount: '',
  maximumAmount: '',
  interestRate: '',
  processingFee: '',
  penaltyRate: '',
  maximumDuration: '',
  repaymentFrequency: 'MONTHLY',
  requiresGuarantor: true,
  requiresBVN: true,
  requiresNIN: false,
  fees: [],
  requirements: [],
};

// Parses a possibly-empty/partial numeric string (e.g. "", "12.", "-")
// into a finite number, defaulting to 0 for anything unparsable.
const toNumber = (value: string): number => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

export function ProductFormModal({ isOpen, onClose, onSubmit, editingProduct }: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        productCode: editingProduct.productCode,
        name: editingProduct.name,
        description: editingProduct.description ?? '',
        minimumAmount: String(editingProduct.minimumAmount),
        maximumAmount: String(editingProduct.maximumAmount),
        interestRate: String(editingProduct.interestRate),
        processingFee: String(editingProduct.processingFee),
        penaltyRate: String(editingProduct.penaltyRate),
        maximumDuration: String(editingProduct.maximumDuration),
        repaymentFrequency: editingProduct.repaymentFrequency,
        requiresGuarantor: editingProduct.requiresGuarantor,
        requiresBVN: editingProduct.requiresBVN,
        requiresNIN: editingProduct.requiresNIN,
        fees: (editingProduct.fees ?? []).map((f) => ({ ...f, amount: String(f.amount) })),
        requirements: editingProduct.requirements ?? [],
      });
    } else {
      setFormData(emptyFormData);
    }
    setError(null);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const minimumAmount = toNumber(formData.minimumAmount);
    const maximumAmount = toNumber(formData.maximumAmount);

    if (maximumAmount < minimumAmount) {
      setError('Maximum amount cannot be less than minimum amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const fees = formData.fees.map((f) => ({ ...f, amount: toNumber(f.amount) }));
      const payload = {
        ...formData,
        minimumAmount,
        maximumAmount,
        interestRate: toNumber(formData.interestRate),
        processingFee: toNumber(formData.processingFee),
        penaltyRate: toNumber(formData.penaltyRate),
        maximumDuration: Math.trunc(toNumber(formData.maximumDuration)),
        fees: fees.length ? fees : undefined,
        requirements: formData.requirements.length ? formData.requirements : undefined,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save product. Please check the form and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground';
  const labelClassName =
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground mb-1.5 block';

  const addFee = () =>
    setFormData({ ...formData, fees: [...formData.fees, { feeName: '', amount: '', percentage: false }] });
  const updateFee = (i: number, patch: Partial<FeeRow>) =>
    setFormData({ ...formData, fees: formData.fees.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) });
  const removeFee = (i: number) =>
    setFormData({ ...formData, fees: formData.fees.filter((_, idx) => idx !== i) });

  const addRequirement = () =>
    setFormData({
      ...formData,
      requirements: [...formData.requirements, { title: '', description: '', required: true }],
    });
  const updateRequirement = (i: number, patch: Partial<RequirementRow>) =>
    setFormData({
      ...formData,
      requirements: formData.requirements.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    });
  const removeRequirement = (i: number) =>
    setFormData({ ...formData, requirements: formData.requirements.filter((_, idx) => idx !== i) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          {editingProduct ? 'Edit Loan Product' : 'Add New Product'}
        </h2>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitClick} className="space-y-4">
          <div>
            <label htmlFor="productCode" className={labelClassName}>Product Code</label>
            <input
              id="productCode"
              className={inputClassName}
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              minLength={2}
              maxLength={20}
              disabled={!!editingProduct}
              required
            />
          </div>
          <div>
            <label htmlFor="name" className={labelClassName}>Product Name</label>
            <input
              id="name"
              className={inputClassName}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              minLength={3}
              maxLength={100}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className={labelClassName}>Description</label>
            <input
              id="description"
              className={inputClassName}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minimumAmount" className={labelClassName}>Min Amount (₦)</label>
              <input
                id="minimumAmount"
                type="number"
                inputMode="decimal"
                min={0.01}
                step="0.01"
                className={inputClassName}
                value={formData.minimumAmount}
                onChange={(e) => setFormData({ ...formData, minimumAmount: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="maximumAmount" className={labelClassName}>Max Amount (₦)</label>
              <input
                id="maximumAmount"
                type="number"
                inputMode="decimal"
                min={0.01}
                step="0.01"
                className={inputClassName}
                value={formData.maximumAmount}
                onChange={(e) => setFormData({ ...formData, maximumAmount: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="interestRate" className={labelClassName}>Interest %</label>
              <input
                id="interestRate"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                className={inputClassName}
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="processingFee" className={labelClassName}>Processing Fee (₦)</label>
              <input
                id="processingFee"
                type="number"
                inputMode="decimal"
                min={0}
                className={inputClassName}
                value={formData.processingFee}
                onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="penaltyRate" className={labelClassName}>Penalty %</label>
              <input
                id="penaltyRate"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                className={inputClassName}
                value={formData.penaltyRate}
                onChange={(e) => setFormData({ ...formData, penaltyRate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maximumDuration" className={labelClassName}>Max Duration (months)</label>
              <input
                id="maximumDuration"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                className={inputClassName}
                value={formData.maximumDuration}
                onChange={(e) => setFormData({ ...formData, maximumDuration: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="repaymentFrequency" className={labelClassName}>Repayment Frequency</label>
              <select
                id="repaymentFrequency"
                className={inputClassName}
                value={formData.repaymentFrequency}
                onChange={(e) =>
                  setFormData({ ...formData, repaymentFrequency: e.target.value as RepaymentFrequency })
                }
                required
              >
                {REPAYMENT_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>{freq.replace('_', '-')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formData.requiresGuarantor}
                onChange={(e) => setFormData({ ...formData, requiresGuarantor: e.target.checked })}
              />
              Requires Guarantor
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formData.requiresBVN}
                onChange={(e) => setFormData({ ...formData, requiresBVN: e.target.checked })}
              />
              Requires BVN
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formData.requiresNIN}
                onChange={(e) => setFormData({ ...formData, requiresNIN: e.target.checked })}
              />
              Requires NIN
            </label>
          </div>

          {/* Fees */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClassName + ' mb-0'}>Fees</label>
              <Button type="button" variant="outline" size="sm" onClick={addFee}>+ Add Fee</Button>
            </div>
            <div className="space-y-2">
              {formData.fees.map((fee, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={inputClassName}
                    placeholder="Fee name"
                    value={fee.feeName}
                    onChange={(e) => updateFee(i, { feeName: e.target.value })}
                  />
                  <input
                    className={inputClassName + ' w-28'}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="Amount"
                    value={fee.amount}
                    onChange={(e) => updateFee(i, { amount: e.target.value })}
                  />
                  <label className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={fee.percentage}
                      onChange={(e) => updateFee(i, { percentage: e.target.checked })}
                    />
                    %
                  </label>
                  <button type="button" onClick={() => removeFee(i)} className="text-destructive text-sm px-1">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClassName + ' mb-0'}>Requirements</label>
              <Button type="button" variant="outline" size="sm" onClick={addRequirement}>+ Add Requirement</Button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((req, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={inputClassName}
                    placeholder="Title (e.g. ID Card)"
                    value={req.title}
                    onChange={(e) => updateRequirement(i, { title: e.target.value })}
                  />
                  <input
                    className={inputClassName}
                    placeholder="Description (optional)"
                    value={req.description ?? ''}
                    onChange={(e) => updateRequirement(i, { description: e.target.value })}
                  />
                  <label className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={req.required}
                      onChange={(e) => updateRequirement(i, { required: e.target.checked })}
                    />
                    Req'd
                  </label>
                  <button type="button" onClick={() => removeRequirement(i)} className="text-destructive text-sm px-1">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}