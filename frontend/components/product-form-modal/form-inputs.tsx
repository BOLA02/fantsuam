'use client';

import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function InputField({ label, id, ...props }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground block">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 mt-1.5"
      />
    </div>
  );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, id, options, ...props }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground block">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring mt-1.5"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function CheckboxField({ label, ...props }: CheckboxFieldProps) {
  return (
    <label className="text-sm text-foreground flex items-center gap-2 mt-2 cursor-pointer">
      <input type="checkbox" {...props} className="rounded border-input text-primary focus:ring-ring" />
      {label}
    </label>
  );
}
