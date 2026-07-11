// components/apply/step1-personal-info.tsx
// FULL FILE — UPDATED: Select onValueChange null-guard

'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplyFormData } from './apply-types';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
}

export function Step1PersonalInfo({ formData, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Personal Information</h2>
        <p className="mt-2 text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">First Name</label>
            <Input value={formData.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="John" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Last Name</label>
            <Input value={formData.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="Doe" className="mt-2" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Middle Name (optional)</label>
          <Input value={formData.middleName} onChange={(e) => onChange('middleName', e.target.value)} placeholder="Middle name" className="mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" value={formData.email} onChange={(e) => onChange('email', e.target.value)} placeholder="john@example.com" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Phone</label>
            <Input value={formData.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="+234 801 234 5678" className="mt-2" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Gender</label>
            <Select value={formData.gender} onValueChange={(value) => onChange('gender', value ?? '')}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Date of Birth</label>
            <Input type="date" value={formData.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} className="mt-2" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Address Line 1</label>
          <Input value={formData.addressLine1} onChange={(e) => onChange('addressLine1', e.target.value)} placeholder="Street address" className="mt-2" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Address Line 2 (optional)</label>
          <Input value={formData.addressLine2} onChange={(e) => onChange('addressLine2', e.target.value)} placeholder="Apartment, suite, etc." className="mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-foreground">City</label>
            <Input value={formData.city} onChange={(e) => onChange('city', e.target.value)} placeholder="City" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">State</label>
            <Input value={formData.state} onChange={(e) => onChange('state', e.target.value)} placeholder="State" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Country</label>
            <Input value={formData.country} onChange={(e) => onChange('country', e.target.value)} placeholder="Country" className="mt-2" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Postal Code (optional)</label>
          <Input value={formData.postalCode} onChange={(e) => onChange('postalCode', e.target.value)} placeholder="Postal code" className="mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">NIN (optional)</label>
            <Input value={formData.nin} onChange={(e) => onChange('nin', e.target.value)} placeholder="00000000000" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">BVN (optional)</label>
            <Input value={formData.bvn} onChange={(e) => onChange('bvn', e.target.value)} placeholder="00000000000" className="mt-2" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Occupation</label>
            <Input value={formData.occupation} onChange={(e) => onChange('occupation', e.target.value)} placeholder="Your occupation" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Employer</label>
            <Input value={formData.employer} onChange={(e) => onChange('employer', e.target.value)} placeholder="Company name" className="mt-2" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Monthly Income</label>
          <Input type="number" value={formData.monthlyIncome} onChange={(e) => onChange('monthlyIncome', e.target.value)} placeholder="₦" className="mt-2" />
        </div>
      </div>
    </div>
  );
}