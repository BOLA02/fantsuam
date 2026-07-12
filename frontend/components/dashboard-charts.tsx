'use client';

import React from 'react';

interface LoanLike {
  status: string;
}

interface RepaymentLike {
  amount: number | string;
  confirmationStatus: string;
  paymentDate: string;
}

interface DashboardChartsProps {
  loans: LoanLike[];
  repayments: RepaymentLike[];
}

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  PENDING_DISBURSEMENT: { label: 'Pending Disbursement', color: 'bg-blue-400' },
  ACTIVE: { label: 'Active', color: 'bg-accent' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500' },
  DEFAULTED: { label: 'Defaulted', color: 'bg-red-500' },
  WRITTEN_OFF: { label: 'Written Off', color: 'bg-purple-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-400' },
};

const STATUS_ORDER = ['ACTIVE', 'COMPLETED', 'PENDING_DISBURSEMENT', 'DEFAULTED', 'WRITTEN_OFF', 'CANCELLED'];

function buildLoanStatusDistribution(loans: LoanLike[]) {
  const total = loans.length;
  if (total === 0) return [];

  const counts = new Map<string, number>();
  for (const loan of loans) {
    counts.set(loan.status, (counts.get(loan.status) ?? 0) + 1);
  }

  return STATUS_ORDER.filter((status) => counts.has(status)).map((status) => ({
    label: STATUS_DISPLAY[status]?.label ?? status,
    color: STATUS_DISPLAY[status]?.color ?? 'bg-gray-400',
    percent: Math.round(((counts.get(status) ?? 0) / total) * 100),
  }));
}

function buildMonthlyCollectionsTrend(repayments: RepaymentLike[]) {
  const now = new Date();
  const months: { key: string; label: string; year: number; month: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  const totalsByKey = new Map<string, number>();
  for (const r of repayments) {
    if (r.confirmationStatus !== 'CONFIRMED') continue;
    const d = new Date(r.paymentDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + Number(r.amount));
  }

  const amounts = months.map((m) => (totalsByKey.get(m.key) ?? 0) / 1_000_000);
  const maxAmount = Math.max(1, ...amounts);

  return months.map((m, i) => ({
    month: m.label,
    amount: amounts[i],
    maxAmount,
  }));
}

export function DashboardCharts({ loans, repayments }: DashboardChartsProps) {
  const distribution = buildLoanStatusDistribution(loans);
  const trend = buildMonthlyCollectionsTrend(repayments);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Loan Status Distribution */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Loan Status Distribution</h3>
        {distribution.length > 0 ? (
          <div className="space-y-4">
            {distribution.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold text-foreground">{item.percent}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No loans yet.</p>
        )}
      </div>

      {/* Monthly Collections Trend */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Collections Trend</h3>
        <div className="space-y-4">
          {trend.map((item) => (
            <div key={item.month} className="flex items-center gap-3">
              <span className="w-12 text-sm font-medium text-muted-foreground">{item.month}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(item.amount / item.maxAmount) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm font-semibold text-foreground">
                ₦{item.amount.toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}