'use client';

import React from 'react';
import { BarChart3, TrendingUp, AlertCircle, DollarSign, FileText } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { DashboardMetrics } from '@/lib/api-types';

interface DashboardStatsGridProps {
  metrics: DashboardMetrics;
}

export function DashboardStatsGrid({ metrics }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Pending Applications"
        value={metrics.pendingApplicationsCount}
        subtitle="Awaiting review"
        icon={<FileText size={24} />}
        trendValue="+12%"
        trend="up"
      />
      <StatCard
        title="Approved Loans"
        value={metrics.approvedLoansCount}
        subtitle="Active in system"
        icon={<TrendingUp size={24} />}
        trendValue="+8%"
        trend="up"
      />
      <StatCard
        title="Outstanding Balance"
        value={`₦${(metrics.totalOutstandingBalance / 1000000).toFixed(1)}M`}
        subtitle="Total loan principal"
        icon={<DollarSign size={24} />}
        trendValue="+5%"
        trend="up"
      />
      <StatCard
        title="Today's Collections"
        value={`₦${(metrics.todaysCollectionsSum / 1000).toFixed(0)}K`}
        subtitle="Amount received today"
        icon={<DollarSign size={24} />}
        trendValue="+15%"
        trend="up"
      />
      <StatCard
        title="Monthly Revenue"
        value={`₦${(metrics.monthlyRevenueSum / 1000000).toFixed(1)}M`}
        subtitle="This month's income"
        icon={<BarChart3 size={24} />}
        trendValue="+22%"
        trend="up"
      />
      <StatCard
        title="Late Payments"
        value={metrics.latePaymentsCount}
        subtitle="Overdue accounts"
        icon={<AlertCircle size={24} />}
        trendValue="+3%"
        trend="down"
        className="md:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
