// components/apply/step3-guarantor.tsx
// FULL FILE — visual redesign pass, matches step1/step2. Same state/handlers as
// original, including the min-w-0/overflow-x-hidden fixes already present.

'use client';

import { useState } from 'react';
import { User, Phone, Users, Mail, Briefcase, Home, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApplyFormData } from './apply-types';
import { OCCUPATION_OPTIONS } from '@/lib/nigeria-data';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
}

const inputClass =
  'h-11 w-full text-[15px] text-foreground placeholder:text-muted-foreground/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block truncate text-[13px] font-medium text-foreground/70">{children}</label>;
}

function Section({
  icon: Icon,
  title,
  hint,
  first,
  children,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`min-w-0 ${first ? '' : 'border-t border-border/60 pt-7'}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon size={14} strokeWidth={2.25} />
          </span>
          <h3 className="truncate text-[15px] font-semibold text-foreground">{title}</h3>
        </div>
        {hint && <span className="shrink-0 text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="min-w-0 pl-9">{children}</div>
    </section>
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
    <div className="w-full min-w-0 space-y-7 overflow-x-hidden">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold text-foreground">Guarantor information</h2>
        <p className="mt-1 text-sm text-muted-foreground">We need a guarantor for your loan</p>
      </div>

      <div className="flex min-w-0 gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" />
        <p className="min-w-0 text-xs leading-relaxed text-foreground/80">
          Your guarantor may be contacted to confirm these details. Choose someone reachable who can vouch for your ability to repay.
        </p>
      </div>

      <Section icon={User} title="Guarantor" first>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <FieldLabel>Full name</FieldLabel>
            <Input
              value={formData.guarantorName}
              onChange={(e) => onChange('guarantorName', e.target.value)}
              placeholder="Full name"
              className={inputClass}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel>Relationship</FieldLabel>
            <div className="relative">
              <Users size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Select value={formData.guarantorRelationship} onValueChange={(value) => onChange('guarantorRelationship', value ?? '')}>
                <SelectTrigger className={`${inputClass} pl-9`}>
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
        </div>
      </Section>

      <Section icon={Phone} title="Contact details">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <FieldLabel>Phone number</FieldLabel>
            <div className="relative">
              <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={formData.guarantorPhone}
                onChange={(e) => onChange('guarantorPhone', e.target.value)}
                placeholder="+234 801 234 5678"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div className="min-w-0">
            <FieldLabel>Email</FieldLabel>
            <div className="relative">
              <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="email"
                value={formData.guarantorEmail}
                onChange={(e) => onChange('guarantorEmail', e.target.value)}
                placeholder="Optional"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Home} title="Additional details" hint="Optional">
        <div className="min-w-0 space-y-4">
          <div className="min-w-0">
            <FieldLabel>Occupation</FieldLabel>
            <div className="relative">
              <Briefcase size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Select value={occupationSelectValue} onValueChange={handleOccupationSelect}>
                <SelectTrigger className={`${inputClass} pl-9`}>
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
            </div>
            {otherSelected && (
              <Input
                value={formData.guarantorOccupation}
                onChange={(e) => onChange('guarantorOccupation', e.target.value)}
                placeholder="Please specify occupation"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>
          <div className="min-w-0">
            <FieldLabel>Address</FieldLabel>
            <Textarea
              value={formData.guarantorAddress}
              onChange={(e) => onChange('guarantorAddress', e.target.value)}
              placeholder="Enter guarantor's address"
              className="w-full resize-none border-border/80 bg-background text-[15px] text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50"
              rows={3}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}