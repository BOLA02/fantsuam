// components/apply/step1-personal-info.tsx
// FULL FILE — semantic tokens restored (headings get your serif/navy style back
// from globals.css automatically). Same props/behavior.

'use client';

import { User, Mail, Phone, Calendar, MapPin, Home, Building2, IdCard, Briefcase, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplyFormData } from './apply-types';
import { SectionHeader } from './section-header';

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

export function Step1PersonalInfo({ formData, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="hidden lg:block">
        <h2 className="text-lg font-bold">Personal Information</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <section>
        <SectionHeader icon={User} title="Identity" />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel icon={User}>First Name</FieldLabel>
              <Input value={formData.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="John" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={User}>Last Name</FieldLabel>
              <Input value={formData.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="Doe" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={User}>Middle Name</FieldLabel>
              <Input value={formData.middleName} onChange={(e) => onChange('middleName', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel icon={User}>Gender</FieldLabel>
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
              <FieldLabel icon={Calendar}>Date of Birth</FieldLabel>
              <Input type="date" value={formData.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Phone} title="Contact Details" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel icon={Mail}>Email</FieldLabel>
            <Input type="email" value={formData.email} onChange={(e) => onChange('email', e.target.value)} placeholder="john@example.com" className={inputClass} />
          </div>
          <div>
            <FieldLabel icon={Phone}>Phone</FieldLabel>
            <Input value={formData.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="+234 801 234 5678" className={inputClass} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Home} title="Home Address" />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel icon={Home}>Address Line 1</FieldLabel>
              <Input value={formData.addressLine1} onChange={(e) => onChange('addressLine1', e.target.value)} placeholder="Street address" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={Home}>Address Line 2</FieldLabel>
              <Input value={formData.addressLine2} onChange={(e) => onChange('addressLine2', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <FieldLabel icon={MapPin}>City</FieldLabel>
              <Input value={formData.city} onChange={(e) => onChange('city', e.target.value)} placeholder="City" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={MapPin}>State</FieldLabel>
              <Input value={formData.state} onChange={(e) => onChange('state', e.target.value)} placeholder="State" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={MapPin}>Country</FieldLabel>
              <Input value={formData.country} onChange={(e) => onChange('country', e.target.value)} placeholder="Country" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={MapPin}>Postal Code</FieldLabel>
              <Input value={formData.postalCode} onChange={(e) => onChange('postalCode', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={IdCard} title="Identification" hint="Optional" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel icon={IdCard}>NIN</FieldLabel>
            <Input value={formData.nin} onChange={(e) => onChange('nin', e.target.value)} placeholder="00000000000" className={inputClass} />
          </div>
          <div>
            <FieldLabel icon={IdCard}>BVN</FieldLabel>
            <Input value={formData.bvn} onChange={(e) => onChange('bvn', e.target.value)} placeholder="00000000000" className={inputClass} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Briefcase} title="Employment & Income" />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel icon={Briefcase}>Occupation</FieldLabel>
              <Input value={formData.occupation} onChange={(e) => onChange('occupation', e.target.value)} placeholder="Your occupation" className={inputClass} />
            </div>
            <div>
              <FieldLabel icon={Building2}>Employer</FieldLabel>
              <Input value={formData.employer} onChange={(e) => onChange('employer', e.target.value)} placeholder="Company name" className={inputClass} />
            </div>
          </div>
          <div className="sm:w-1/2">
            <FieldLabel icon={Wallet}>Monthly Income</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
              <Input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => onChange('monthlyIncome', e.target.value)}
                placeholder="0.00"
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}