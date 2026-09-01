// components/apply/step1-personal-info.tsx
// FULL FILE — visual redesign pass. State/handlers unchanged from original.

'use client';

import { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Home, Building2, IdCard, Briefcase, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplyFormData } from './apply-types';
import { NIGERIA_STATE_OPTIONS, OCCUPATION_OPTIONS, getLgaOptions } from '@/lib/nigeria-data';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
}

const inputClass =
  'h-11 text-[15px] text-foreground placeholder:text-muted-foreground/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50';

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-foreground/70">
      {children}
    </label>
  );
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
    <section className={`${first ? '' : 'border-t border-border/60 pt-7'}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon size={14} strokeWidth={2.25} />
          </span>
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        </div>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="pl-9">{children}</div>
    </section>
  );
}

const OCCUPATION_PRESET_VALUES = new Set(OCCUPATION_OPTIONS.map((o) => o.value).filter((v) => v !== 'Other'));

export function Step1PersonalInfo({ formData, onChange }: Props) {
  const [otherSelected, setOtherSelected] = useState(
    () => !!formData.occupation && !OCCUPATION_PRESET_VALUES.has(formData.occupation)
  );

  const occupationSelectValue = otherSelected
    ? 'Other'
    : OCCUPATION_PRESET_VALUES.has(formData.occupation)
    ? formData.occupation
    : '';

  function handleOccupationSelect(value: string | null) {
    const v = value ?? '';
    if (v === 'Other') {
      setOtherSelected(true);
      onChange('occupation', '');
    } else {
      setOtherSelected(false);
      onChange('occupation', v);
    }
  }

  function handleStateSelect(value: string | null) {
    const v = value ?? '';
    onChange('state', v);
    // A previously-selected LGA may not belong to the new state — clear it
    // rather than silently leaving a mismatched value behind.
    onChange('city', '');
  }

  const lgaOptions = getLgaOptions(formData.state);

  // NIN/BVN are optional — only flagged once something has been typed and
  // it isn't a valid 11-digit number. Typing itself is capped at 11 digits
  // (see onChange below), so this mainly catches "fewer than 11" mid-entry.
  const ninInvalid = !!formData.nin && !/^\d{11}$/.test(formData.nin);
  const bvnInvalid = !!formData.bvn && !/^\d{11}$/.test(formData.bvn);

  return (
    <div className="space-y-7">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold text-foreground">Personal information</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <Section icon={User} title="Identity" first>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <FieldLabel>First name</FieldLabel>
              <Input value={formData.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="John" className={inputClass} />
            </div>
            <div>
              <FieldLabel>Last name</FieldLabel>
              <Input value={formData.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="Doe" className={inputClass} />
            </div>
            <div>
              <FieldLabel>Middle name</FieldLabel>
              <Input value={formData.middleName} onChange={(e) => onChange('middleName', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Gender</FieldLabel>
              <Select value={formData.gender} onValueChange={(value) => onChange('gender', value ?? '')}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Date of birth</FieldLabel>
              <div className="relative">
                <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => onChange('dateOfBirth', e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Phone} title="Contact details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Email</FieldLabel>
            <div className="relative">
              <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="john@example.com"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <div className="relative">
              <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="+234 801 234 5678"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Home} title="Home address">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Address line 1</FieldLabel>
              <Input value={formData.addressLine1} onChange={(e) => onChange('addressLine1', e.target.value)} placeholder="Street address" className={inputClass} />
            </div>
            <div>
              <FieldLabel>Address line 2</FieldLabel>
              <Input value={formData.addressLine2} onChange={(e) => onChange('addressLine2', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <FieldLabel>State</FieldLabel>
              <Select value={formData.state} onValueChange={handleStateSelect}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIA_STATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>LGA</FieldLabel>
              <Select
                value={formData.city}
                onValueChange={(value) => onChange('city', value ?? '')}
                disabled={!formData.state}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder={formData.state ? 'Select LGA' : 'Select a state first'} />
                </SelectTrigger>
                <SelectContent>
                  {lgaOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Country</FieldLabel>
              <div className="relative">
                <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input value="Nigeria" disabled className={`${inputClass} pl-9 bg-muted/50 text-muted-foreground`} />
              </div>
            </div>
            <div>
              <FieldLabel>Postal code</FieldLabel>
              <Input value={formData.postalCode} onChange={(e) => onChange('postalCode', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={IdCard} title="Identification" hint="Optional">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>NIN</FieldLabel>
            <Input
              value={formData.nin}
              onChange={(e) => onChange('nin', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="00000000000"
              inputMode="numeric"
              maxLength={11}
              aria-invalid={ninInvalid}
              className={`${inputClass} ${ninInvalid ? 'border-destructive focus-visible:ring-destructive/40 focus-visible:border-destructive' : ''}`}
            />
            {ninInvalid && <p className="mt-1.5 text-xs text-destructive">NIN must be exactly 11 digits.</p>}
          </div>
          <div>
            <FieldLabel>BVN</FieldLabel>
            <Input
              value={formData.bvn}
              onChange={(e) => onChange('bvn', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="00000000000"
              inputMode="numeric"
              maxLength={11}
              aria-invalid={bvnInvalid}
              className={`${inputClass} ${bvnInvalid ? 'border-destructive focus-visible:ring-destructive/40 focus-visible:border-destructive' : ''}`}
            />
            {bvnInvalid && <p className="mt-1.5 text-xs text-destructive">BVN must be exactly 11 digits.</p>}
          </div>
        </div>
      </Section>

      <Section icon={Briefcase} title="Employment & income">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Occupation</FieldLabel>
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
                  value={formData.occupation}
                  onChange={(e) => onChange('occupation', e.target.value)}
                  placeholder="Please specify your occupation"
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>
            <div>
              <FieldLabel>Employer</FieldLabel>
              <div className="relative">
                <Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  value={formData.employer}
                  onChange={(e) => onChange('employer', e.target.value)}
                  placeholder="Company name"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>
          <div className="sm:w-1/2">
            <FieldLabel>Monthly income</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[15px] text-muted-foreground/70">
                <Wallet size={15} className="text-muted-foreground/60" />
                ₦
              </span>
              <Input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => onChange('monthlyIncome', e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}