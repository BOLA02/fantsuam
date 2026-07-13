'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
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

const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground';
const labelClassName = 'mb-1.5 block text-sm font-medium text-foreground';

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

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
      setError('Maximum amount cannot be less than minimum amount.');
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
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save product. Please check the form and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editingProduct ? 'Edit Loan Product' : 'New Loan Product'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {editingProduct
                ? `Editing ${editingProduct.productCode}`
                : 'Configure a new loan product for your borrowers.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmitClick} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormSection title="Basic information">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <label htmlFor="description" className={labelClassName}>Description</label>
                <input
                  id="description"
                  className={inputClassName}
                  placeholder="Optional — shown to loan officers and borrowers"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </FormSection>

            <FormSection title="Loan terms" description="Amount range, cost, and repayment structure.">
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
              <div className="grid grid-cols-3 gap-3">
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
            </FormSection>

            <FormSection title="Eligibility requirements" description="What a borrower must provide to qualify.">
              <div className="flex flex-wrap gap-3">
                {([
                  ['requiresGuarantor', 'Guarantor'],
                  ['requiresBVN', 'BVN'],
                  ['requiresNIN', 'NIN'],
                ] as const).map(([key, label]) => (
                  <label
                    key={key}
                    className={
                      'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ' +
                      (formData[key]
                        ? 'border-primary/40 bg-primary/5 text-foreground'
                        : 'border-border text-muted-foreground hover:bg-secondary/50')
                    }
                  >
                    <input
                      type="checkbox"
                      checked={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Fees" description="Any additional charges beyond interest.">
              <div className="space-y-2">
                {formData.fees.map((fee, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
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
                    <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={fee.percentage}
                        onChange={(e) => updateFee(i, { percentage: e.target.checked })}
                        className="accent-primary"
                      />
                      %
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFee(i)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove fee"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFee}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
                >
                  <Plus size={15} /> Add fee
                </button>
              </div>
            </FormSection>

            <FormSection title="Documentation requirements" description="Listed items borrowers must submit.">
              <div className="space-y-2">
                {formData.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
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
                    <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={req.required}
                        onChange={(e) => updateRequirement(i, { required: e.target.checked })}
                        className="accent-primary"
                      />
                      Req'd
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRequirement(i)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove requirement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
                >
                  <Plus size={15} /> Add requirement
                </button>
              </div>
            </FormSection>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-border bg-card px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editingProduct ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}