'use client';

import React from 'react';
import { Input } from '@/components/form';

interface SettingsProfileFormProps {
  organizationName: string;
  email: string;
  phone: string;
  applicationFeeEnabled: boolean;
  applicationFeeAmount: number;
  onFieldChange: (field: string, value: string) => void;
}

export function SettingsProfileForm({ organizationName, email, phone, applicationFeeEnabled, applicationFeeAmount, onFieldChange }: SettingsProfileFormProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Organization Profile</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Organization Name</label>
          <Input
            value={organizationName}
            onChange={(e) => onFieldChange('organizationName', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Phone</label>
          <Input
            value={phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">Application Fee</h3>
        <p className="mt-1 text-sm text-muted-foreground">Require a verified Paystack payment before a customer can begin a loan application.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-medium text-foreground">
            <input type="checkbox" checked={applicationFeeEnabled} onChange={(e) => onFieldChange('applicationFeeEnabled', String(e.target.checked))} />
            Require application-fee payment
          </label>
          <div>
            <label className="text-sm font-medium text-foreground">Amount (₦)</label>
            <Input type="number" min="0" step="1" value={applicationFeeAmount / 100} onChange={(e) => onFieldChange('applicationFeeAmount', e.target.value)} className="mt-2" disabled={!applicationFeeEnabled} />
            <p className="mt-1 text-xs text-muted-foreground">Stored in kobo for precise Paystack charges.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
