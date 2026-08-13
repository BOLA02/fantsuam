'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Download,
  Eye,
  Search,
  X,
  AlertCircle,
  RefreshCw,
  Users,
  Wallet,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { api } from '@/lib/api-routes';

interface CustomerAddress {
  id: string;
  city: string;
  state: string;
}

interface CustomerEmployment {
  id: string;
  employerName: string;
  occupation: string;
  monthlyIncome: string | number;
  isCurrent: boolean;
}

interface CustomerRow {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  employments?: CustomerEmployment[];
  addresses?: CustomerAddress[];
}

// ---------- helpers ----------

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function formatNaira(amount: number) {
  if (!amount) return '₦0';
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount}`;
}

function relativeMemberSince(dateStr: string) {
  const date = new Date(dateStr);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function currentEmployment(row: CustomerRow) {
  return row.employments?.find((e) => e.isCurrent) ?? row.employments?.[0];
}

const AVATAR_PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
];

function avatarColor(seed: string) {
  const idx = seed.charCodeAt(0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

// ---------- skeleton ----------

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="h-9 w-9 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-2.5 w-1/4 rounded bg-muted" />
          </div>
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-3 w-14 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ---------- stat card ----------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2E3192]/10 text-[#2E3192]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const loadCustomersData = useCallback(async (query?: string, isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      else setIsSearching(true);
      setError('');

      const res = query ? await api.customers.search(query) : await api.customers.getAll();
      setCustomers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with customer directory modules.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCustomersData(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchTerm) {
      loadCustomersData();
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      loadCustomersData(searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const stats = useMemo(() => {
    const total = customers.length;
    const incomes = customers
      .map((c) => Number(currentEmployment(c)?.monthlyIncome ?? 0))
      .filter((n) => n > 0);
    const avgIncome = incomes.length
      ? Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length)
      : 0;
    const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
    const newThisMonth = customers.filter(
      (c) => new Date(c.createdAt).getTime() >= thirtyDaysAgo
    ).length;
    return { total, avgIncome, newThisMonth };
  }, [customers]);

  const columns: Column<CustomerRow>[] = [
    {
      key: 'customerNumber',
      header: 'Customer ID',
      sortable: true,
      cell: (row) => (
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
          {row.customerNumber}
        </span>
      ),
    },
    {
      key: 'firstName',
      header: 'Customer',
      sortable: true,
      cell: (row) => {
        const fullName = `${row.firstName} ${row.lastName}`;
        const location = row.addresses?.[0]
          ? `${row.addresses[0].city}, ${row.addresses[0].state}`
          : null;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                row.firstName || '?'
              )}`}
            >
              {initials(row.firstName, row.lastName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
              {location && (
                <p className="truncate text-xs text-muted-foreground">{location}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Contact',
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <p className="font-medium text-foreground">{row.phone}</p>
          {row.email ? (
            <p className="text-muted-foreground">{row.email}</p>
          ) : (
            <p className="italic text-muted-foreground/70">No email on file</p>
          )}
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Employment & Income',
      cell: (row) => {
        const job = currentEmployment(row);
        const income = job ? Number(job.monthlyIncome) : 0;
        return (
          <div className="text-xs">
            <p className="text-sm font-semibold text-foreground">{formatNaira(income)}</p>
            {job ? (
              <p className="truncate text-muted-foreground">
                {job.occupation} · {job.employerName}
              </p>
            ) : (
              <p className="italic text-muted-foreground/70">No employment on file</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Member Since',
      sortable: true,
      cell: (row) => (
        <span
          className="text-xs text-muted-foreground"
          title={new Date(row.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        >
          {relativeMemberSince(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'id',
      header: '',
      cell: (row) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs focus-visible:ring-2 focus-visible:ring-[#2E3192] focus-visible:ring-offset-1"
            render={<Link href={`/admin/customers/${row.id}`} />}
          >
            <Eye size={14} />
            View
          </Button>
        </div>
      ),
    },
  ];

  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Browse profiles, contact details, and employment records across your customer base."
      />

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Customers" value={stats.total.toLocaleString()} />
        <StatCard icon={Wallet} label="Avg. Monthly Income" value={formatNaira(stats.avgIncome)} />
        <StatCard icon={UserPlus} label="New This Month" value={stats.newThisMonth.toLocaleString()} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, phone, or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <Button nativeButton={true} className="bg-primary hover:bg-primary/90 shrink-0">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-amber-300 bg-white text-xs text-amber-800 hover:bg-amber-100"
            onClick={() => loadCustomersData(searchTerm || undefined, true)}
          >
            <RefreshCw size={12} />
            Retry
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        {isLoading ? (
          <TableSkeleton />
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {hasSearch ? 'No matches found' : 'No customers yet'}
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {hasSearch
                ? `We couldn't find anyone matching "${searchTerm}". Try a different name, phone number, or email.`
                : 'Customer profiles will appear here once they are added to the directory.'}
            </p>
            {hasSearch && (
              <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="relative">
            {isSearching && (
              <div className="absolute right-0 top-0 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E3192]" />
                Updating…
              </div>
            )}
            <DataTable
              data={customers}
              columns={columns}
              emptyMessage="No matching customer indices found in database partitions."
            />
          </div>
        )}
      </div>
    </div>
  );
}