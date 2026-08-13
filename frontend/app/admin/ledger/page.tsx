'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Download,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Scale,
  BookOpen,
  RotateCw,
  X,
  Filter,
  Copy,
  Check,
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
  groupKey: string;
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
        narration:
          sorted.length > 1
            ? `${first.narration.split(' · ')[0]} (${sorted.length} installments)`
            : first.narration,
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

const typeStyleMap: Record<TransactionType, string> = {
  LOAN_DISBURSEMENT: 'bg-slate-100 text-slate-700',
  REPAYMENT: 'bg-indigo-50 text-indigo-700',
  INTEREST: 'bg-violet-50 text-violet-700',
  PENALTY: 'bg-rose-50 text-rose-700',
  PROCESSING_FEE: 'bg-slate-100 text-slate-600',
  ADJUSTMENT: 'bg-gray-100 text-gray-600',
};

const typeDotMap: Record<TransactionType, string> = {
  LOAN_DISBURSEMENT: 'bg-slate-500',
  REPAYMENT: 'bg-indigo-500',
  INTEREST: 'bg-violet-500',
  PENALTY: 'bg-rose-500',
  PROCESSING_FEE: 'bg-slate-400',
  ADJUSTMENT: 'bg-gray-400',
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

function initials(name: string) {
  if (!name || name === '—') return '—';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

/* ------------------------------------------------------------------ */
/* Details modal — replaces the old inline row-expansion. A modal     */
/* keeps the table rows a fixed, scannable height and gives the       */
/* "hidden on small screens" columns (customer, type, ledger #) a     */
/* single place to always live, instead of leaking into an in-row     */
/* card that reflows the table.                                      */
/* ------------------------------------------------------------------ */
function LedgerDetailsModal({
  group,
  onClose,
  formatCurrency,
}: {
  group: GroupedLedgerRow;
  onClose: () => void;
  formatCurrency: (n: number) => string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const isMultiEntry = group.entries.length > 1;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function copyLedgerNumber() {
    navigator.clipboard?.writeText(group.ledgerNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-white shadow-xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {new Date(group.date).toLocaleDateString(undefined, {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-foreground break-words">{group.narration}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {initials(group.customerName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{group.customerName}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">Loan {group.loanNumber}</p>
            </div>
            <div className="ml-auto">
              <TypeTag type={group.type} />
            </div>
          </div>

          {/* Amount summary */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-slate-50 p-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Debit</p>
              <p className="text-sm font-semibold text-rose-700 tabular-nums">
                {group.totalDebit > 0 ? formatCurrency(group.totalDebit) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Credit</p>
              <p className="text-sm font-semibold text-indigo-700 tabular-nums">
                {group.totalCredit > 0 ? formatCurrency(group.totalCredit) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Balance</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(group.finalBalance)}</p>
            </div>
          </div>

          {/* Ledger number */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ledger #</p>
              <p className="text-sm font-mono text-foreground">{group.ledgerNumber}</p>
            </div>
            <button
              type="button"
              onClick={copyLedgerNumber}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-slate-100 hover:text-foreground"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Installment timeline */}
          {isMultiEntry && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                {group.entries.length} installments in this transaction
              </p>
              <ol className="relative border-l border-border pl-4 space-y-4">
                {group.entries.map((e) => (
                  <li key={e.id} className="relative">
                    <span
                      className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${typeDotMap[e.type]}`}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                      <span className="text-xs font-medium text-foreground">
                        {new Date(e.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">{e.ledgerNumber}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{e.narration}</p>
                    <div className="mt-0.5 flex gap-4 text-xs tabular-nums">
                      <span className="text-rose-700">{e.debit > 0 ? formatCurrency(e.debit) : '—'}</span>
                      <span className="text-indigo-700">{e.credit > 0 ? formatCurrency(e.credit) : '—'}</span>
                      <span className="font-medium text-foreground">Bal {formatCurrency(e.balance)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TYPE_FILTERS: { label: string; value: TransactionType | 'ALL' }[] = [
  { label: 'All types', value: 'ALL' },
  { label: 'Disbursement', value: 'LOAN_DISBURSEMENT' },
  { label: 'Repayment', value: 'REPAYMENT' },
  { label: 'Interest', value: 'INTEREST' },
  { label: 'Penalty', value: 'PENALTY' },
  { label: 'Processing fee', value: 'PROCESSING_FEE' },
  { label: 'Adjustment', value: 'ADJUSTMENT' },
];

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [entries, setEntries] = useState<NormalizedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState<GroupedLedgerRow | null>(null);

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

  const formatCurrency = (amount: number) =>
    `₦${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const groups = useMemo(() => groupEntries(entries), [entries]);
  const filteredGroups = useMemo(
    () => (typeFilter === 'ALL' ? groups : groups.filter((g) => g.type === typeFilter)),
    [groups, typeFilter],
  );

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

        <div className="relative">
          <Filter size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
            className="h-9 rounded-md border border-border bg-white pl-7 pr-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
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
        ) : filteredGroups.length === 0 ? (
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
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border bg-slate-50">
                  <th className="py-3 pl-4 pr-2 w-[10%]">Date</th>
                  <th className="py-3 px-2 w-[28%]">Narration</th>
                  <th className="py-3 px-2 w-[16%] hidden lg:table-cell">Customer</th>
                  <th className="py-3 px-2 w-[12%] hidden md:table-cell">Type</th>
                  <th className="py-3 px-2 w-[11%] text-right">Debit</th>
                  <th className="py-3 px-2 w-[11%] text-right">Credit</th>
                  <th className="py-3 pl-2 pr-4 w-[12%] text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr
                    key={group.groupKey}
                    onClick={() => setActiveGroup(group)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${group.narration}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveGroup(group);
                      }
                    }}
                    className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <td className="py-3 pl-4 pr-2 text-foreground truncate">
                      {new Date(group.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-2 text-foreground truncate" title={group.narration}>
                      {group.narration}
                      {group.entries.length > 1 && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 align-middle">
                          {group.entries.length}×
                        </span>
                      )}
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
                    <td className="py-3 pl-2 pr-4 font-semibold text-foreground text-right tabular-nums truncate">
                      {formatCurrency(group.finalBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeGroup && (
        <LedgerDetailsModal
          group={activeGroup}
          onClose={() => setActiveGroup(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}