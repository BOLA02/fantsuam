'use client';

import React from 'react';

export function DashboardCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Loan Status Distribution */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Loan Status Distribution</h3>
        <div className="space-y-4">
          {[
            { label: 'Active', value: 35, color: 'bg-accent' },
            { label: 'Completed', value: 28, color: 'bg-green-500' },
            { label: 'Suspended', value: 12, color: 'bg-orange-500' },
            { label: 'Defaulted', value: 5, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-semibold text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Collections Trend */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Collections Trend</h3>
        <div className="space-y-4">
          {[
            { month: 'Jan', amount: 2.5 },
            { month: 'Feb', amount: 2.8 },
            { month: 'Mar', amount: 2.2 },
            { month: 'Apr', amount: 3.1 },
            { month: 'May', amount: 3.5 },
            { month: 'Jun', amount: 4.2 },
          ].map((item) => (
            <div key={item.month} className="flex items-center gap-3">
              <span className="w-12 text-sm font-medium text-muted-foreground">{item.month}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(item.amount / 5) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-semibold text-foreground">₦{item.amount}M</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
