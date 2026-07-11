'use client';

import { useState } from 'react';
import { BookOpen, Download } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { mockData } from '@/lib/mock-data';

interface LedgerRow {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  receiptNumber: string;
  transactionType: string;
}

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const ledger: LedgerRow[] = mockData.ledger
    .filter(entry =>
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.receiptNumber.includes(searchTerm)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const columns: Column<LedgerRow>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
    },
    {
      key: 'transactionType',
      header: 'Type',
      sortable: true,
      cell: (row) => {
        const colorMap: Record<string, 'default' | 'primary' | 'accent' | 'secondary' | 'destructive'> = {
          Disbursement: 'primary',
          Repayment: 'accent',
          Penalty: 'destructive',
          Interest: 'accent',
          Fee: 'secondary',
        };
        return (
          <Badge variant={colorMap[row.transactionType] || 'default'} size="sm">
            {row.transactionType}
          </Badge>
        );
      },
    },
    {
      key: 'debit',
      header: 'Debit',
      sortable: true,
      cell: (row) => row.debit > 0 ? `₦${(row.debit / 1000).toFixed(0)}K` : '-',
    },
    {
      key: 'credit',
      header: 'Credit',
      sortable: true,
      cell: (row) => row.credit > 0 ? `₦${(row.credit / 1000).toFixed(0)}K` : '-',
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-foreground">₦{(row.balance / 1000000).toFixed(1)}M</span>
      ),
    },
    {
      key: 'receiptNumber',
      header: 'Receipt',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.receiptNumber}</span>,
    },
  ];

  const totalDebits = ledger.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = ledger.reduce((sum, entry) => sum + entry.credit, 0);
  const currentBalance = ledger.length > 0 ? ledger[0].balance : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Ledger"
        description="Complete record of all financial transactions"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Debits</p>
          <p className="text-2xl font-bold text-foreground mt-2">₦{(totalDebits / 1000000).toFixed(1)}M</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Credits</p>
          <p className="text-2xl font-bold text-accent mt-2">₦{(totalCredits / 1000000).toFixed(1)}M</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Current Balance</p>
          <p className="text-2xl font-bold text-foreground mt-2">₦{(currentBalance / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by description or receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DataTable
          data={ledger}
          columns={columns}
          emptyMessage="No transactions found"
        />
      </div>
    </div>
  );
}
