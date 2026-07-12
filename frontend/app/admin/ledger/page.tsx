'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { api } from '@/lib/api-routes';
import { LedgerEntry, TransactionType } from '@/lib/api-types';

interface LedgerRow {
  id: string;
  date: string;
  narration: string;
  customerName: string;
  loanNumber: string;
  type: TransactionType;
  debit: number;
  credit: number;
  balance: number;
  ledgerNumber: string;
}

function toRow(entry: LedgerEntry): LedgerRow {
  const txn = entry.transaction;
  return {
    id: entry.id,
    date: txn.transactionDate,
    narration: entry.narration,
    customerName: txn.loan?.customer ? `${txn.loan.customer.firstName} ${txn.loan.customer.lastName}` : '—',
    loanNumber: txn.loan?.loanNumber ?? '—',
    type: txn.transactionType,
    // Backend Decimal fields arrive as strings over JSON (Prisma's Decimal
    // serializes via toJSON -> string), regardless of the TS type saying
    // `number`. Coerce explicitly here so all downstream math is real math.
    debit: Number(entry.debit),
    credit: Number(entry.credit),
    balance: Number(entry.balance),
    ledgerNumber: entry.ledgerNumber,
  };
}

const typeColorMap: Record<TransactionType, 'default' | 'primary' | 'accent' | 'secondary' | 'destructive'> = {
  LOAN_DISBURSEMENT: 'primary',
  REPAYMENT: 'accent',
  INTEREST: 'accent',
  PENALTY: 'destructive',
  PROCESSING_FEE: 'secondary',
  ADJUSTMENT: 'default',
};

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLedger = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.ledger.getAll({ search: search || undefined });
      if (res.success && res.data) {
        setRows(res.data.map(toRow));
      } else {
        setError(res.message || 'Failed to load ledger.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  useEffect(() => {
    const t = setTimeout(() => fetchLedger(searchTerm || undefined), 350);
    return () => clearTimeout(t);
  }, [searchTerm, fetchLedger]);

  // Defensive: Number(...) here too, in case a raw string ever slips through
  // a future edit that bypasses toRow.
  const formatCurrency = (amount: number) => `₦${Number(amount).toLocaleString()}`;

  const totalDebits = rows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredits = rows.reduce((sum, r) => sum + r.credit, 0);

  const columns: Column<LedgerRow>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
    { key: 'narration', header: 'Narration', sortable: true },
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'loanNumber', header: 'Loan', sortable: true },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      cell: (row) => (
        <Badge variant={typeColorMap[row.type] || 'default'} size="sm">
          {row.type.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'debit',
      header: 'Debit',
      sortable: true,
      cell: (row) => (row.debit > 0 ? formatCurrency(row.debit) : '—'),
    },
    {
      key: 'credit',
      header: 'Credit',
      sortable: true,
      cell: (row) => (row.credit > 0 ? formatCurrency(row.credit) : '—'),
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">{formatCurrency(row.balance)}</span>,
    },
    {
      key: 'ledgerNumber',
      header: 'Ledger #',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.ledgerNumber}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Ledger" description="Complete record of all financial transactions" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Debits</p>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalDebits)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Credits</p>
          <p className="text-2xl font-bold text-accent mt-2">{formatCurrency(totalCredits)}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by narration, ledger #, or loan number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" disabled title="Export not yet implemented">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading ledger...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : (
          <DataTable data={rows} columns={columns} emptyMessage="No transactions found" />
        )}
      </div>
    </div>
  );
}