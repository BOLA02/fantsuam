'use client';

import { useState } from 'react';
import { RotateCw, Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { mockData } from '@/lib/mock-data';

interface RepaymentRow {
  id: string;
  customerName: string;
  amount: number;
  method: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
}

export default function RepaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const repayments: RepaymentRow[] = mockData.repayments
    .map(rep => {
      const customer = mockData.customers.find(c => c.id === rep.customerId);
      return {
        id: rep.id,
        customerName: `${customer?.firstName} ${customer?.lastName}`,
        amount: rep.amount,
        method: rep.method,
        dueDate: new Date(rep.dueDate).toLocaleDateString(),
        paidDate: rep.paidDate ? new Date(rep.paidDate).toLocaleDateString() : null,
        status: rep.status,
      };
    })
    .filter(rep =>
      rep.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const columns: Column<RepaymentRow>[] = [
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-foreground">₦{(row.amount / 1000).toFixed(0)}K</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      sortable: true,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
    },
    {
      key: 'paidDate',
      header: 'Paid Date',
      sortable: true,
      cell: (row) => row.paidDate || '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repayments"
        description="Track and manage loan repayment transactions"
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-2" />
          Record Payment
        </Button>
        <Button variant="outline">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <DataTable
          data={repayments}
          columns={columns}
          emptyMessage="No repayments found"
        />
      </div>
    </div>
  );
}
