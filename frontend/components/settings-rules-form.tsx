'use client';

import React from 'react';
import { Input } from '@/components/form';

interface SettingsRulesFormProps {
  penaltyRate: string;
  minimumInstallments: string;
  maximumInstallments: string;
  onFieldChange: (field: string, value: string) => void;
}

export function SettingsRulesForm({ penaltyRate, minimumInstallments, maximumInstallments, onFieldChange }: SettingsRulesFormProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Penalty & Repayment Rules</h3>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-foreground">Late Payment Penalty (%)</label>
          <Input
            type="number"
            step="0.1"
            value={penaltyRate}
            onChange={(e) => onFieldChange('penaltyRate', e.target.value)}
            className="mt-2"
          />
        </div>
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
