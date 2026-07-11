'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { api } from '@/lib/api-routes';
import { LoanApplication } from '@/lib/api-types';

interface ApplicationRow {
  id: string;
  applicationNumber: string;
  customerName: string;
  requestedAmount: number;
  productName: string;
  status: string;
  createdAt: string;
}

function toRow(app: LoanApplication): ApplicationRow {
  return {
    id: app.id,
    applicationNumber: app.applicationNumber,
    customerName: `${app.customer?.firstName ?? ''} ${app.customer?.lastName ?? ''}`.trim() || '—',
    requestedAmount: app.requestedAmount,
    productName: app.loanProduct?.name ?? 'Unknown',
    status: app.status,
    createdAt: app.createdAt,
  };
}

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.loanApplications.getAll();
      if (response.success && response.data) {
        setApplications(response.data.map(toRow));
      } else {
        setError(response.message || 'Failed to load applications.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Backend has no free-text search endpoint, so filter client-side over the fetched set
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return applications;
    return applications.filter(
      (app) =>
        app.applicationNumber.toLowerCase().includes(term) ||
        app.customerName.toLowerCase().includes(term)
    );
  }, [applications, searchTerm]);

  const columns: Column<ApplicationRow>[] = [
    {
      key: 'applicationNumber',
      header: 'Application ID',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-sm font-semibold text-foreground">
          {row.applicationNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'productName',
      header: 'Loan Product',
      sortable: true,
    },
    {
      key: 'requestedAmount',
      header: 'Amount',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-foreground">₦{(row.requestedAmount / 1000).toFixed(0)}K</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
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
          <Link href={`/admin/applications/${row.id}`}>
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
      <PageHeader
        title="Applications"
        description="Manage loan applications and track approval status"
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by application ID or customer name..."
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
          <div className="p-6 text-center text-muted-foreground">Loading applications...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : (
          <DataTable data={filtered} columns={columns} emptyMessage="No applications found" />
        )}
      </div>
    </div>
  );
}