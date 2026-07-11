'use client';

import { InputField, SelectField, CheckboxField } from './form-inputs';

interface SectionProps {
  formData: any;
  onChange: (fields: any) => void;
  disabled?: boolean;
}

export function IdentitySection({ formData, onChange, disabled }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <InputField
            id="productCode"
            label="Product Code"
            value={formData.productCode}
            onChange={(e) => onChange({ productCode: e.target.value.toUpperCase() })}
            placeholder="LP001"
            required
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <InputField
            id="name"
            label="Product Name"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
          />
        </div>
      </div>
      <InputField
        id="description"
        label="Description"
        value={formData.description}
        onChange={(e) => onChange({ description: e.target.value })}
      />
    </div>
  );
}

export function FinancialsSection({ formData, onChange }: SectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField
        id="minimumAmount"
        label="Min Amount (₦)"
        type="number"
        value={formData.minimumAmount}
        onChange={(e) => onChange({ minimumAmount: Number(e.target.value) })}
        required
      />
      <InputField
        id="maximumAmount"
        label="Max Amount (₦)"
        type="number"
        value={formData.maximumAmount}
        onChange={(e) => onChange({ maximumAmount: Number(e.target.value) })}
        required
      />
    </div>
  );
}

export function RatesSection({ formData, onChange }: SectionProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <InputField
        id="interestRate"
        label="Interest Rate %"
        type="number"
        step="0.01"
        value={formData.interestRate}
        onChange={(e) => onChange({ interestRate: Number(e.target.value) })}
        required
      />
      <InputField
        id="processingFee"
        label="Processing Fee (₦)"
        type="number"
        value={formData.processingFee}
        onChange={(e) => onChange({ processingFee: Number(e.target.value) })}
        required
      />
      <InputField
        id="penaltyRate"
        label="Penalty Rate %"
        type="number"
        step="0.01"
        value={formData.penaltyRate}
        onChange={(e) => onChange({ penaltyRate: Number(e.target.value) })}
        required
      />
    </div>
  );
}

export function DurationSection({ formData, onChange }: SectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InputField
        id="maximumDuration"
        label="Max Duration (Months)"
        type="number"
        value={formData.maximumDuration}
        onChange={(e) => onChange({ maximumDuration: Number(e.target.value) })}
        required
      />
      <SelectField
        id="repaymentFrequency"
        label="Repayment Frequency"
        value={formData.repaymentFrequency}
        onChange={(e) => onChange({ repaymentFrequency: e.target.value })}
        options={[
          { value: 'DAILY', label: 'Daily' },
          { value: 'WEEKLY', label: 'Weekly' },
          { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
          { value: 'MONTHLY', label: 'Monthly' },
        ]}
      />
    </div>
  );
}

export function GovernanceSection({ formData, onChange }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-6 py-2">
        <CheckboxField
          label="Requires Guarantor"
          checked={formData.requiresGuarantor}
          onChange={(e) => onChange({ requiresGuarantor: e.target.checked })}
        />
        <CheckboxField
          label="Requires BVN"
          checked={formData.requiresBVN}
          onChange={(e) => onChange({ requiresBVN: e.target.checked })}
        />
        <CheckboxField
          label="Requires NIN"
          checked={formData.requiresNIN}
          onChange={(e) => onChange({ requiresNIN: e.target.checked })}
        />
      </div>
      <InputField
        id="requirements"
        label="Requirements (comma separated)"
        value={formData.requirements}
        onChange={(e) => onChange({ requirements: e.target.value })}
        placeholder="Passport Photograph, Work ID Card"
      />
    </div>
  );
}
