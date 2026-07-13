'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Download,
  ChevronRight,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Scale,
  BookOpen,
  RotateCw,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
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

// Deliberately not using the shared Badge component here — its "secondary" /
// "primary" variants render as the app's brand green, and its default
// padding is oversized for a dense table column. This is a small, self-
// contained pill with explicit, non-green colors and a minimal footprint.
const typeStyleMap: Record<TransactionType, string> = {
  LOAN_DISBURSEMENT: 'bg-slate-100 text-slate-700',
  REPAYMENT: 'bg-indigo-50 text-indigo-700',
  INTEREST: 'bg-violet-50 text-violet-700',
  PENALTY: 'bg-rose-50 text-rose-700',
  PROCESSING_FEE: 'bg-slate-100 text-slate-600',
  ADJUSTMENT: 'bg-gray-100 text-gray-600',
};

function TypeTag({ type }: { type: TransactionType }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight whitespace-nowrap ${
        typeStyleMap[type] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {type.replace(/_/g, ' ')}
    </span>
  );
}

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

  const formatCurrency = (amount: number) =>
    `₦${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const groups = useMemo(() => groupEntries(entries), [entries]);
  const totalDebits = useMemo(() => entries.reduce((sum, e) => sum + e.debit, 0), [entries]);
  const totalCredits = useMemo(() => entries.reduce((sum, e) => sum + e.credit, 0), [entries]);
  const netMovement = totalCredits - totalDebits;

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Ledger" description="Complete record of all financial transactions" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <ArrowUpCircle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total debits</p>
            <p className="text-lg font-semibold text-foreground tabular-nums truncate">
              {loading ? '—' : formatCurrency(totalDebits)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <ArrowDownCircle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total credits</p>
            <p className="text-lg font-semibold text-foreground tabular-nums truncate">
              {loading ? '—' : formatCurrency(totalCredits)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Scale size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Net movement</p>
            <p className="text-lg font-semibold text-foreground tabular-nums truncate">
              {loading ? '—' : `${netMovement >= 0 ? '+' : '−'}${formatCurrency(Math.abs(netMovement))}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
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

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <RotateCw size={20} className="animate-spin" />
            <p className="text-sm">Loading ledger…</p>
          </div>
        ) : error ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => fetchLedger(searchTerm || undefined)}
              className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Try again
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-muted-foreground mb-1">
              <BookOpen size={20} />
            </div>
            <p className="text-sm font-medium text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {searchTerm
                ? `No entries match "${searchTerm}". Try a different term.`
                : 'Ledger entries will show up here once transactions are recorded.'}
            </p>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border bg-slate-50">
                  <th className="py-3 pl-4 pr-2 w-[9%]">Date</th>
                  <th className="py-3 px-2 w-[24%]">Narration</th>
                  <th className="py-3 px-2 w-[15%] hidden lg:table-cell">Customer</th>
                  <th className="py-3 px-2 w-[10%] hidden md:table-cell">Type</th>
                  <th className="py-3 px-2 w-[10%] text-right">Debit</th>
                  <th className="py-3 px-2 w-[10%] text-right">Credit</th>
                  <th className="py-3 px-2 w-[10%] text-right">Balance</th>
                  <th className="py-3 pl-2 pr-2 w-[9%] hidden sm:table-cell">Ledger #</th>
                  <th className="py-3 pl-2 pr-4 w-[8%] text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.groupKey);
                  const isMultiEntry = group.entries.length > 1;
                  return (
                    <>
                      <tr
                        key={group.groupKey}
                        className="group border-b border-border last:border-0 transition-colors hover:bg-slate-50"
                      >
                        <td className="py-3 pl-4 pr-2 text-foreground truncate">
                          {new Date(group.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-3 px-2 text-foreground truncate" title={group.narration}>
                          {group.narration}
                        </td>
                        <td className="py-3 px-2 text-foreground truncate hidden lg:table-cell">
                          {group.customerName}
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <TypeTag type={group.type} />
                        </td>
                        <td className="py-3 px-2 text-foreground text-right tabular-nums truncate">
                          {group.totalDebit > 0 ? formatCurrency(group.totalDebit) : '—'}
                        </td>
                        <td className="py-3 px-2 text-foreground text-right tabular-nums truncate">
                          {group.totalCredit > 0 ? formatCurrency(group.totalCredit) : '—'}
                        </td>
                        <td className="py-3 px-2 font-semibold text-foreground text-right tabular-nums truncate">
                          {formatCurrency(group.finalBalance)}
                        </td>
                        <td className="py-3 pl-2 pr-2 font-mono text-xs text-muted-foreground truncate hidden sm:table-cell">
                          {group.ledgerNumber}
                        </td>
                        <td className="py-3 pl-2 pr-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => toggleExpand(group.groupKey)}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? 'Hide transaction details' : 'Show transaction details'}
                              title={isExpanded ? 'Hide details' : 'Show details'}
                              className={`group/toggle inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                                isExpanded
                                  ? 'border-primary/30 bg-primary/10 text-primary'
                                  : 'border-border text-muted-foreground hover:bg-slate-100 hover:text-foreground'
                              }`}
                            >
                              Details
                              <ChevronRight
                                size={13}
                                className={`transition-transform duration-200 ease-out ${
                                  isExpanded ? 'rotate-90' : 'rotate-0 group-hover/toggle:translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-border last:border-0 bg-slate-50">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="rounded-lg border border-border bg-slate-50 p-3 space-y-3">
                              {/* Fields hidden as table columns on narrower screens — always
                                  surfaced here so no detail is ever fully out of reach. */}
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                                <div>
                                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Customer</dt>
                                  <dd className="text-sm text-foreground truncate">{group.customerName}</dd>
                                </div>
                                <div>
                                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Loan</dt>
                                  <dd className="text-sm text-foreground font-mono truncate">{group.loanNumber}</dd>
                                </div>
                                <div>
                                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Type</dt>
                                  <dd className="mt-0.5">
                                    <TypeTag type={group.type} />
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Ledger #</dt>
                                  <dd className="text-sm text-foreground font-mono truncate">{group.ledgerNumber}</dd>
                                </div>
                              </dl>

                              {isMultiEntry && (
                                <div className="border-t border-border pt-3">
                                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                                    {group.entries.length} entries in this transaction
                                  </p>
                                  <div className="space-y-1.5">
                                    {group.entries.map((e) => (
                                      <div
                                        key={e.id}
                                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-md bg-slate-50 px-3 py-2 text-xs"
                                      >
                                        <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                                          <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                                          <span className="text-foreground shrink-0">
                                            {new Date(e.date).toLocaleDateString(undefined, {
                                              day: '2-digit',
                                              month: 'short',
                                            })}
                                          </span>
                                          <span className="truncate">{e.narration}</span>
                                        </span>
                                        <span className="flex items-center gap-4 shrink-0 tabular-nums">
                                          <span className="text-muted-foreground">
                                            Debit {e.debit > 0 ? formatCurrency(e.debit) : '—'}
                                          </span>
                                          <span className="text-muted-foreground">
                                            Credit {e.credit > 0 ? formatCurrency(e.credit) : '—'}
                                          </span>
                                          <span className="text-foreground font-medium">
                                            Bal {formatCurrency(e.balance)}
                                          </span>
                                          <span className="font-mono text-muted-foreground">{e.ledgerNumber}</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
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