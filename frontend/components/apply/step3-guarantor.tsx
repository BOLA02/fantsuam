// components/apply/step3-guarantor.tsx
// FULL FILE — UPDATED: null-guard on relationship Select

'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApplyFormData } from './apply-types';

interface Props {
  formData: ApplyFormData;
  onChange: (field: keyof ApplyFormData, value: string) => void;
}

export function Step3Guarantor({ formData, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Guarantor Information</h2>
        <p className="mt-2 text-muted-foreground">We need a guarantor for your loan</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Guarantor Full Name</label>
          <Input value={formData.guarantorName} onChange={(e) => onChange('guarantorName', e.target.value)} placeholder="Full name" className="mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <Input value={formData.guarantorPhone} onChange={(e) => onChange('guarantorPhone', e.target.value)} placeholder="+234 801 234 5678" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Relationship</label>
            <Select value={formData.guarantorRelationship} onValueChange={(value) => onChange('guarantorRelationship', value ?? '')}>
              <SelectTrigger className="mt-2">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">Email (optional)</label>
            <Input type="email" value={formData.guarantorEmail} onChange={(e) => onChange('guarantorEmail', e.target.value)} placeholder="guarantor@example.com" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Occupation (optional)</label>
            <Input value={formData.guarantorOccupation} onChange={(e) => onChange('guarantorOccupation', e.target.value)} placeholder="Occupation" className="mt-2" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Address</label>
          <Textarea value={formData.guarantorAddress} onChange={(e) => onChange('guarantorAddress', e.target.value)} placeholder="Enter guarantor's address" className="mt-2" rows={3} />
        </div>
      </div>
    </div>
  );
}