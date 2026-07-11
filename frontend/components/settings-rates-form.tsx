'use client';

import React from 'react';
import { Input } from '@/components/form';

interface SettingsRatesFormProps {
  values: {
    businessLoanRate: string;
    salaryLoanRate: string;
    smeLoanRate: string;
    emergencyLoanRate: string;
    agricultureLoanRate: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

export function SettingsRatesForm({ values, onFieldChange }: SettingsRatesFormProps) {
  const loops = [
    { label: 'Business Loan', field: 'businessLoanRate' },
    { label: 'Salary Loan', field: 'salaryLoanRate' },
    { label: 'SME Loan', field: 'smeLoanRate' },
    { label: 'Emergency Loan', field: 'emergencyLoanRate' },
    { label: 'Agriculture Loan', field: 'agricultureLoanRate' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Interest Rates (% p.a)</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {loops.map((item) => (
          <div key={item.field}>
            <label className="text-sm font-medium text-foreground">{item.label}</label>
            <Input
              type="number"
              step="0.1"
              value={values[item.field as keyof typeof values]}
              onChange={(e) => onFieldChange(item.field, e.target.value)}
              className="mt-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
