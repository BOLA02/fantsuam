// components/apply/step3-guarantor.tsx
// FULL FILE — Guarantor Occupation converted from free-text Input to Select,
// same OCCUPATION_OPTIONS + "Other" fallback pattern as Step 1.

'use client';

import { useState } from 'react';
import { User, Phone, Users, Mail, Briefcase, Home, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApplyFormData } from './apply-types';
import { SectionHeader } from './section-header';
import { OCCUPATION_OPTIONS } from '@/lib/nigeria-data';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
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

const OCCUPATION_PRESET_VALUES = new Set(OCCUPATION_OPTIONS.map((o) => o.value).filter((v) => v !== 'Other'));

export function Step3Guarantor({ formData, onChange }: Props) {
  const [otherSelected, setOtherSelected] = useState(
    () => !!formData.guarantorOccupation && !OCCUPATION_PRESET_VALUES.has(formData.guarantorOccupation)
  );

  const occupationSelectValue = otherSelected
    ? 'Other'
    : OCCUPATION_PRESET_VALUES.has(formData.guarantorOccupation)
    ? formData.guarantorOccupation
    : '';

  function handleOccupationSelect(value: string | null) {
    const v = value ?? '';
    if (v === 'Other') {
      setOtherSelected(true);
      onChange('guarantorOccupation', '');
    } else {
      setOtherSelected(false);
      onChange('guarantorOccupation', v);
    }
  }

  return (
    <div className="space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-lg font-bold">Guarantor Information</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">We need a guarantor for your loan</p>
      </div>

      <div className="flex gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs text-foreground/80">
          Your guarantor may be contacted to confirm these details. Choose someone reachable who can vouch for your ability to repay.
        </p>
      </div>

      <section>
        <SectionHeader icon={User} title="Guarantor" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel icon={User}>Full Name</FieldLabel>
            <Input value={formData.guarantorName} onChange={(e) => onChange('guarantorName', e.target.value)} placeholder="Full name" className={inputClass} />
          </div>
          <div>
            <FieldLabel icon={Users}>Relationship</FieldLabel>
            <Select value={formData.guarantorRelationship} onValueChange={(value) => onChange('guarantorRelationship', value ?? '')}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Phone} title="Contact Details" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel icon={Phone}>Phone Number</FieldLabel>
            <Input value={formData.guarantorPhone} onChange={(e) => onChange('guarantorPhone', e.target.value)} placeholder="+234 801 234 5678" className={inputClass} />
          </div>
          <div>
            <FieldLabel icon={Mail}>Email</FieldLabel>
            <Input type="email" value={formData.guarantorEmail} onChange={(e) => onChange('guarantorEmail', e.target.value)} placeholder="Optional" className={inputClass} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Home} title="Additional Details" hint="Optional" />
        <div className="space-y-3">
          <div>
            <FieldLabel icon={Briefcase}>Occupation</FieldLabel>
            <Select value={occupationSelectValue} onValueChange={handleOccupationSelect}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {OCCUPATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {otherSelected && (
              <Input
                value={formData.guarantorOccupation}
                onChange={(e) => onChange('guarantorOccupation', e.target.value)}
                placeholder="Please specify occupation"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>
          <div>
            <FieldLabel icon={Home}>Address</FieldLabel>
            <Textarea
              value={formData.guarantorAddress}
              onChange={(e) => onChange('guarantorAddress', e.target.value)}
              placeholder="Enter guarantor's address"
              className="resize-none text-sm text-foreground placeholder:text-muted-foreground/60"
              rows={3}
            />
          </div>
        </div>
      </section>
    </div>
  );
}