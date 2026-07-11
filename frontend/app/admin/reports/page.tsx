'use client';

import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';

export default function ReportsPage() {
  // Calculate report statistics
  const totalLoans = mockData.loans.length;
  const totalDisbursed = mockData.loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalRepayments = mockData.repayments
    .filter(r => r.status === 'Paid')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalOutstanding = mockData.loans
    .filter(l => l.status !== 'Completed')
    .reduce((sum, l) => sum + (l.principalAmount - (totalRepayments / totalLoans)), 0);
  const defaultRate = (mockData.loans.filter(l => l.status === 'Defaulted').length / totalLoans) * 100;
  const totalInterestEarned = mockData.ledger
    .filter(l => l.transactionType === 'Interest')
    .reduce((sum, l) => sum + l.credit, 0);
  const totalPenalties = mockData.ledger
    .filter(l => l.transactionType === 'Penalty')
    .reduce((sum, l) => sum + l.credit, 0);

  const loanStatusData = [
    { label: 'Active', value: mockData.loans.filter(l => l.status === 'Active').length },
    { label: 'Completed', value: mockData.loans.filter(l => l.status === 'Completed').length },
    { label: 'Suspended', value: mockData.loans.filter(l => l.status === 'Suspended').length },
    { label: 'Defaulted', value: mockData.loans.filter(l => l.status === 'Defaulted').length },
  ];

  const collectionsByMonth = [
    { month: 'Jan', amount: 2.5 },
    { month: 'Feb', amount: 2.8 },
    { month: 'Mar', amount: 2.2 },
    { month: 'Apr', amount: 3.1 },
    { month: 'May', amount: 3.5 },
    { month: 'Jun', amount: 4.2 },
  ];

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
          trendValue="-2%"
        />
        <StatCard
          title="Interest Earned"
          value={`₦${(totalInterestEarned / 1000000).toFixed(1)}M`}
          subtitle="Total interest income"
          icon={<BarChart3 size={24} />}
          trend="up"
          trendValue="+12%"
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
            {loanStatusData.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-muted-foreground">{item.label}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${(item.value / Math.max(...loanStatusData.map(d => d.value))) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collections Trend */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Collections Trend</h3>
          <div className="space-y-4">
            {collectionsByMonth.map((item) => (
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

      {/* Top Loan Products */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Top Loan Products</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {mockData.loanProducts.map((product) => {
            const productLoans = mockData.applications.filter(a => a.productId === product.id);
            const totalAmount = productLoans.reduce((sum, a) => sum + a.loanAmount, 0);
            return (
              <div key={product.id} className="rounded-lg border border-border bg-secondary/50 p-4">
                <p className="text-sm font-semibold text-foreground">{product.name}</p>
                <p className="mt-3 text-2xl font-bold text-accent">₦{(totalAmount / 1000000).toFixed(1)}M</p>
                <p className="mt-1 text-xs text-muted-foreground">{productLoans.length} applications</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
