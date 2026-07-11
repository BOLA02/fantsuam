'use client';

import React from 'react';
import { Input } from '@/components/form';

interface SettingsProfileFormProps {
  organizationName: string;
  email: string;
  phone: string;
  onFieldChange: (field: string, value: string) => void;
}

export function SettingsProfileForm({ organizationName, email, phone, onFieldChange }: SettingsProfileFormProps) {
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
    </div>
  );
}
