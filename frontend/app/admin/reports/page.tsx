'use client';

import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  // Placeholder values - ready to be wired up later
  const totalDisbursed = 0;
  const totalRepayments = 0;
  const totalOutstanding = 0;
  const defaultRate = 0;
  const totalInterestEarned = 0;
  const totalPenalties = 0;

  const loanStatusData: { label: string; value: number }[] = [
    { label: 'Active', value: 0 },
    { label: 'Completed', value: 0 },
    { label: 'Suspended', value: 0 },
    { label: 'Defaulted', value: 0 },
  ];

  const collectionsByMonth: { month: string; amount: number }[] = [];

  const topLoanProducts: { id: string; name: string; totalAmount: number; count: number }[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Reports & Analytics"
          description="Comprehensive business intelligence and insights"
        />
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar size={18} className="mr-2" />
            Date Range
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Download size={18} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Loan Portfolio"
          value={`₦${(totalDisbursed / 1000000).toFixed(1)}M`}
          subtitle="Total amount disbursed"
          icon={<TrendingUp size={24} />}
        />
        <StatCard
          title="Collections"
          value={`₦${(totalRepayments / 1000000).toFixed(1)}M`}
          subtitle="Total repayments received"
          icon={<TrendingUp size={24} />}
        />
        <StatCard
          title="Outstanding Balance"
          value={`₦${(totalOutstanding / 1000000).toFixed(1)}M`}
          subtitle="Amount still owed"
          icon={<BarChart3 size={24} />}
        />
        <StatCard
          title="Default Rate"
          value={`${defaultRate.toFixed(1)}%`}
          subtitle="Percentage of defaulted loans"
          icon={<TrendingUp size={24} />}
          trend="down"
          trendValue="0%"
        />
        <StatCard
          title="Interest Earned"
          value={`₦${(totalInterestEarned / 1000000).toFixed(1)}M`}
          subtitle="Total interest income"
          icon={<BarChart3 size={24} />}
          trend="up"
          trendValue="0%"
        />
        <StatCard
          title="Penalties Collected"
          value={`₦${(totalPenalties / 1000).toFixed(0)}K`}
          subtitle="Late payment penalties"
          icon={<TrendingUp size={24} />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loan Status Distribution */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Loan Status Distribution</h3>
          <div className="space-y-4">
            {loanStatusData.map((item) => {
              const maxVal = Math.max(...loanStatusData.map(d => d.value));
              const fillWidth = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium text-muted-foreground">{item.label}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${fillWidth}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collections Trend */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Collections Trend</h3>
          <div className="space-y-4">
            {collectionsByMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No current trend data</p>
            ) : (
              collectionsByMonth.map((item) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Loan Products */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Top Loan Products</h3>
        {topLoanProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No active products to display</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {topLoanProducts.map((product) => (
              <div key={product.id} className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="text-sm font-semibold text-foreground">{product.name}</p>
                <p className="mt-3 text-2xl font-bold text-accent">₦{(product.totalAmount / 1000000).toFixed(1)}M</p>
                <p className="mt-1 text-xs text-muted-foreground">{product.count} applications</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
