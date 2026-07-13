// components/settings-rules-form.tsx

'use client';

import React from 'react';
import { Input } from '@/components/form';

interface SettingsRulesFormProps {
  minimumInstallments: string;
  maximumInstallments: string;
  onFieldChange: (field: string, value: string) => void;
}

export function SettingsRulesForm({ minimumInstallments, maximumInstallments, onFieldChange }: SettingsRulesFormProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Repayment Rules</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">Minimum Installments (months)</label>
          <Input
            type="number"
            value={minimumInstallments}
            onChange={(e) => onFieldChange('minimumInstallments', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Maximum Installments (months)</label>
          <Input
            type="number"
            value={maximumInstallments}
            onChange={(e) => onFieldChange('maximumInstallments', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}