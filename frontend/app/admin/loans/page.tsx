'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { api } from '@/lib/api-routes';
import { Loan } from '@/lib/api-types';

interface LoanRow {
  id: string;
  customerName: string;
  approvedAmount: number;
  disbursedAmount: number;
  monthlyInstallment: number | null;
  nextDueDate: string | null;
  status: string;
  disbursementDate: string | null;
}

function toRow(loan: Loan): LoanRow {
  return {
    id: loan.id,
    customerName: loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName}` : '—',
    approvedAmount: loan.approvedAmount,
    disbursedAmount: loan.disbursedAmount,
    monthlyInstallment: loan.nextInstallment?.totalAmount ?? null,
    nextDueDate: loan.nextInstallment?.dueDate ?? null,
    status: loan.status,
    disbursementDate: loan.disbursementDate ?? null,
  };
}

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.loans.getAll(search ? { search } : undefined);
      if (response.success && response.data) {
        setLoans(response.data.map(toRow));
      } else {
        setError(response.message || 'Failed to load loans.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Debounced server-side search
  useEffect(() => {
    const t = setTimeout(() => fetchLoans(searchTerm || undefined), 350);
    return () => clearTimeout(t);
  }, [searchTerm, fetchLoans]);

  const formatCurrency = (amount: number) => `₦${(amount / 1000).toFixed(0)}K`;
  const formatDate = (date: string | null) => (date ? new Date(date).toLocaleDateString() : '—');

  const columns: Column<LoanRow>[] = [
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'approvedAmount',
      header: 'Approved Amount',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">{formatCurrency(row.approvedAmount)}</span>,
    },
    {
      key: 'disbursedAmount',
      header: 'Disbursed',
      sortable: true,
      cell: (row) => <span className="text-foreground">{formatCurrency(row.disbursedAmount)}</span>,
    },
    {
      key: 'monthlyInstallment',
      header: 'Next Installment',
      sortable: true,
      cell: (row) =>
        row.monthlyInstallment !== null ? (
          <div className="leading-tight">
            <div className="font-semibold text-foreground">{formatCurrency(row.monthlyInstallment)}</div>
            <div className="text-xs text-muted-foreground">{formatDate(row.nextDueDate)}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'disbursementDate',
      header: 'Disbursement Date',
      sortable: true,
      cell: (row) => formatDate(row.disbursementDate),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
    {
      key: 'id',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Link href={`/admin/loans/${row.id}`}>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">
              <Eye size={16} />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Loans" description="Monitor active loans and repayment status" />

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90" disabled title="Export not yet implemented">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading loans...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : (
          <DataTable data={loans} columns={columns} emptyMessage="No loans found" />
        )}
      </div>
    </div>
  );
}