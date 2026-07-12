'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { api } from '@/lib/api-routes';
import { LedgerEntry, TransactionType } from '@/lib/api-types';

interface NormalizedEntry {
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
  groupKey: string; // repayment's transactionGroupId, or this entry's own id if not a repayment split
}

function normalize(entry: LedgerEntry): NormalizedEntry {
  const txn = entry.transaction;
  return {
    id: entry.id,
    date: txn.transactionDate,
    narration: entry.narration,
    customerName: txn.loan?.customer ? `${txn.loan.customer.firstName} ${txn.loan.customer.lastName}` : '—',
    loanNumber: txn.loan?.loanNumber ?? '—',
    type: txn.transactionType,
    debit: Number(entry.debit),
    credit: Number(entry.credit),
    balance: Number(entry.balance),
    ledgerNumber: entry.ledgerNumber,
    groupKey: (txn as any).repayment?.transactionGroupId ?? entry.id,
  };
}

interface GroupedLedgerRow {
  groupKey: string;
  date: string;
  narration: string;
  customerName: string;
  loanNumber: string;
  type: TransactionType;
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
  ledgerNumber: string;
  entries: NormalizedEntry[];
}

function groupEntries(entries: NormalizedEntry[]): GroupedLedgerRow[] {
  const groups = new Map<string, NormalizedEntry[]>();
  for (const e of entries) {
    const list = groups.get(e.groupKey) ?? [];
    list.push(e);
    groups.set(e.groupKey, list);
  }

  return Array.from(groups.entries())
    .map(([groupKey, list]) => {
      const sorted = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      return {
        groupKey,
        date: first.date,
        narration: sorted.length > 1 ? `${first.narration.split(' · ')[0]} (${sorted.length} installments)` : first.narration,
        customerName: first.customerName,
        loanNumber: first.loanNumber,
        type: first.type,
        totalDebit: sorted.reduce((sum, e) => sum + e.debit, 0),
        totalCredit: sorted.reduce((sum, e) => sum + e.credit, 0),
        finalBalance: last.balance,
        ledgerNumber: sorted.length > 1 ? groupKey : first.ledgerNumber,
        entries: sorted,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  const [entries, setEntries] = useState<NormalizedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const fetchLedger = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.ledger.getAll({ search: search || undefined });
      if (res.success && res.data) {
        setEntries(res.data.map(normalize));
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

  function toggleExpand(groupKey: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }

  const formatCurrency = (amount: number) => `₦${Number(amount).toLocaleString()}`;

  const groups = groupEntries(entries);
  const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);

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
        ) : groups.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border bg-secondary/30">
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Narration</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Loan</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Debit</th>
                  <th className="py-3 px-4">Credit</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Ledger #</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.groupKey);
                  const isMultiEntry = group.entries.length > 1;
                  return (
                    <>
                      <tr key={group.groupKey} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          {isMultiEntry && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(group.groupKey)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground">{new Date(group.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-foreground">{group.narration}</td>
                        <td className="py-3 px-4 text-foreground">{group.customerName}</td>
                        <td className="py-3 px-4 text-foreground">{group.loanNumber}</td>
                        <td className="py-3 px-4">
                          <Badge variant={typeColorMap[group.type] || 'default'} size="sm">
                            {group.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {group.totalDebit > 0 ? formatCurrency(group.totalDebit) : '—'}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {group.totalCredit > 0 ? formatCurrency(group.totalCredit) : '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {formatCurrency(group.finalBalance)}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground">{group.ledgerNumber}</td>
                      </tr>
                      {isExpanded &&
                        group.entries.map((e) => (
                          <tr key={e.id} className="border-b border-border last:border-0 bg-secondary/20">
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4 text-xs text-muted-foreground">
                              {new Date(e.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 text-xs text-muted-foreground" colSpan={4}>
                              {e.narration}
                            </td>
                            <td className="py-2 px-4 text-xs text-muted-foreground">
                              {e.debit > 0 ? formatCurrency(e.debit) : '—'}
                            </td>
                            <td className="py-2 px-4 text-xs text-muted-foreground">
                              {e.credit > 0 ? formatCurrency(e.credit) : '—'}
                            </td>
                            <td className="py-2 px-4 text-xs text-muted-foreground">{formatCurrency(e.balance)}</td>
                            <td className="py-2 px-4 font-mono text-xs text-muted-foreground">{e.ledgerNumber}</td>
                          </tr>
                        ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}