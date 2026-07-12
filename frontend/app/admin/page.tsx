'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, DashboardMetrics, RecentApplication } from '@/lib/api-types';

import { DashboardStatsGrid } from '@/components/dashboard-stats-grid';
import { DashboardCharts } from '@/components/dashboard-charts';

const PENDING_APPLICATION_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED'];

interface Trend {
  value: string;
  direction: 'up' | 'down';
}

/**
 * Real period-over-period % change. Returns null when there's no prior-period
 * data to compare against — showing "+0%" or "new" would be a fabricated
 * signal just as much as a hardcoded number would be.
 */
function computeTrend(current: number, previous: number): Trend | null {
  if (previous === 0) return null;
  const pctChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(pctChange));
  return {
    value: `${pctChange >= 0 ? '+' : '-'}${rounded}%`,
    direction: pctChange >= 0 ? 'up' : 'down',
  };
}

function countInRange(items: { createdAt: string }[], start: Date, end: Date): number {
  return items.filter((item) => {
    const d = new Date(item.createdAt);
    return d >= start && d < end;
  }).length;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [rawLoans, setRawLoans] = useState<any[]>([]);
  const [rawRepayments, setRawRepayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [pendingApplicationsTrend, setPendingApplicationsTrend] = useState<Trend | null>(null);
  const [approvedLoansTrend, setApprovedLoansTrend] = useState<Trend | null>(null);
  const [todaysCollectionsTrend, setTodaysCollectionsTrend] = useState<Trend | null>(null);
  const [monthlyRevenueTrend, setMonthlyRevenueTrend] = useState<Trend | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError('');

        const [appsRes, loansRes, repaymentsRes] = await Promise.all([
          apiClient<ApiResponse<any[]>>('/loan-applications'),
          apiClient<ApiResponse<any[]>>('/loans'),
          apiClient<ApiResponse<any[]>>('/repayments'),
        ]);

        const applications = appsRes.data ?? [];
        const loans = loansRes.data ?? [];
        const repayments = repaymentsRes.data ?? [];

        setRawLoans(loans);
        setRawRepayments(repayments);

        const pendingApplicationsCount = applications.filter((a) =>
          PENDING_APPLICATION_STATUSES.includes(a.status)
        ).length;

        // A Loan row only ever exists once its source application was
        // approved (see loan-application.service.ts's APPROVED branch),
        // so counting loans is the direct signal — no re-derivation needed.
        const approvedLoansCount = loans.length;

        const totalOutstandingBalance = loans.reduce(
          (sum, l) => sum + Number(l.outstandingBalance || 0),
          0
        );

        const todayKey = new Date().toDateString();
        const todaysCollectionsSum = repayments
          .filter(
            (r) =>
              r.confirmationStatus === 'CONFIRMED' &&
              new Date(r.paymentDate).toDateString() === todayKey
          )
          .reduce((sum, r) => sum + Number(r.amount || 0), 0);

        const now = new Date();
        const monthlyRevenueSum = repayments
          .filter((r) => {
            if (r.confirmationStatus !== 'CONFIRMED') return false;
            const d = new Date(r.paymentDate);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((sum, r) => sum + Number(r.amount || 0), 0);

        // RepaymentSchedule.status is the real overdue signal — the loans
        // list already returns each loan's next unpaid installment status.
        const latePaymentsCount = loans.filter((l) => l.nextInstallment?.status === 'OVERDUE').length;

        const recentApplications: RecentApplication[] = applications
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((app) => ({
            id: app.id,
            applicationNumber: app.applicationNumber,
            customerName: app.customer ? `${app.customer.firstName} ${app.customer.lastName}` : '—',
            loanAmount: Number(app.requestedAmount || 0),
            status: app.status,
            createdAt: new Date(app.createdAt).toLocaleDateString(),
          }));

        // Real period-over-period trends, computed from timestamps already
        // in the fetched data — no extra requests, no fabricated numbers.
        const now7 = new Date();
        const sevenDaysAgo = new Date(now7);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date(now7);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const applicationsLast7 = countInRange(applications, sevenDaysAgo, now7);
        const applicationsPrior7 = countInRange(applications, fourteenDaysAgo, sevenDaysAgo);
        setPendingApplicationsTrend(computeTrend(applicationsLast7, applicationsPrior7));

        const loansLast7 = countInRange(loans, sevenDaysAgo, now7);
        const loansPrior7 = countInRange(loans, fourteenDaysAgo, sevenDaysAgo);
        setApprovedLoansTrend(computeTrend(loansLast7, loansPrior7));

        const yesterdayKey = new Date(now.getTime() - 86400000).toDateString();
        const yesterdaysCollectionsSum = repayments
          .filter(
            (r) =>
              r.confirmationStatus === 'CONFIRMED' &&
              new Date(r.paymentDate).toDateString() === yesterdayKey
          )
          .reduce((sum, r) => sum + Number(r.amount || 0), 0);
        setTodaysCollectionsTrend(computeTrend(todaysCollectionsSum, yesterdaysCollectionsSum));

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthRevenueSum = repayments
          .filter((r) => {
            if (r.confirmationStatus !== 'CONFIRMED') return false;
            const d = new Date(r.paymentDate);
            return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
          })
          .reduce((sum, r) => sum + Number(r.amount || 0), 0);
        setMonthlyRevenueTrend(computeTrend(monthlyRevenueSum, lastMonthRevenueSum));

        setMetrics({
          pendingApplicationsCount,
          approvedLoansCount,
          totalOutstandingBalance,
          todaysCollectionsSum,
          monthlyRevenueSum,
          latePaymentsCount,
          recentApplications,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const columns: Column<RecentApplication>[] = [
    {
      key: 'applicationNumber',
      header: 'Application ID',
      sortable: true,
      cell: (row) => <span className="font-mono text-sm font-semibold">{row.applicationNumber}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      cell: (row) => <span className="text-sm">{row.customerName}</span>,
    },
    {
      key: 'loanAmount',
      header: 'Amount',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">₦{(row.loanAmount / 1000).toFixed(0)}K</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      cell: (row) => <span className="text-sm text-muted-foreground">{row.createdAt}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
    {
      key: 'id',
      header: 'Action',
      cell: (row) => (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/applications/${row.id}`} />}>
          View
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#2E3192]" />
        <p className="text-sm text-muted-foreground font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Performance Dashboard" />
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Performance Dashboard" />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Notice: {error}</span>
        </div>
      )}

      <DashboardStatsGrid
        metrics={metrics}
        pendingApplicationsTrend={pendingApplicationsTrend}
        approvedLoansTrend={approvedLoansTrend}
        todaysCollectionsTrend={todaysCollectionsTrend}
        monthlyRevenueTrend={monthlyRevenueTrend}
      />

      <DashboardCharts loans={rawLoans} repayments={rawRepayments} />

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
          <p className="mt-1 text-sm text-muted-foreground">Latest submissions requiring review</p>
        </div>
        <div className="p-6">
          <DataTable data={metrics.recentApplications} columns={columns} emptyMessage="No applications found" />
        </div>
      </div>
    </div>
  );
}