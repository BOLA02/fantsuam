'use client';

import React from 'react';
import { BarChart3, TrendingUp, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { DashboardMetrics } from '@/lib/api-types';

interface Trend {
  value: string;
  direction: 'up' | 'down';
}

interface DashboardStatsGridProps {
  metrics: DashboardMetrics;
  pendingApplicationsTrend?: Trend | null;
  approvedLoansTrend?: Trend | null;
  todaysCollectionsTrend?: Trend | null;
  monthlyRevenueTrend?: Trend | null;
}

/** Picks K vs M based on real magnitude so small amounts don't round to 0.0M. */
export function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

export function DashboardStatsGrid({
  metrics,
  pendingApplicationsTrend,
  approvedLoansTrend,
  todaysCollectionsTrend,
  monthlyRevenueTrend,
}: DashboardStatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Pending Applications"
        value={metrics.pendingApplicationsCount}
        subtitle="Awaiting review"
        icon={<FileText size={24} />}
        {...(pendingApplicationsTrend
          ? { trendValue: pendingApplicationsTrend.value, trend: pendingApplicationsTrend.direction }
          : {})}
      />
      <StatCard
        title="Approved Loans"
        value={metrics.approvedLoansCount}
        subtitle="Active in system"
        icon={<TrendingUp size={24} />}
        {...(approvedLoansTrend
          ? { trendValue: approvedLoansTrend.value, trend: approvedLoansTrend.direction }
          : {})}
      />
      <StatCard
        title="Outstanding Balance"
        value={formatMoney(metrics.totalOutstandingBalance)}
        subtitle="Total loan principal"
        icon={<DollarSign size={24} />}
      />
      <StatCard
        title="Today's Collections"
        value={formatMoney(metrics.todaysCollectionsSum)}
        subtitle="Amount received today"
        icon={<DollarSign size={24} />}
        {...(todaysCollectionsTrend
          ? { trendValue: todaysCollectionsTrend.value, trend: todaysCollectionsTrend.direction }
          : {})}
      />
      <StatCard
        title="Monthly Revenue"
        value={formatMoney(metrics.monthlyRevenueSum)}
        subtitle="This month's income"
        icon={<BarChart3 size={24} />}
        {...(monthlyRevenueTrend
          ? { trendValue: monthlyRevenueTrend.value, trend: monthlyRevenueTrend.direction }
          : {})}
      />
      <StatCard
        title="Late Payments"
        value={metrics.latePaymentsCount}
        subtitle="Overdue accounts"
        icon={<AlertCircle size={24} />}
        className="md:col-span-2 lg:col-span-1"
      />
    </div>
  );
}