'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RotateCw,
  Download,
  Plus,
  X,
  Check,
  ChevronRight,
  Search,
  Wallet,
  Landmark,
  Clock3,
  CircleCheck,
  ArrowLeft,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/form';
import { api } from '@/lib/api-routes';
import { Repayment, Loan } from '@/lib/api-types';

interface GroupedPayment {
  transactionGroupId: string;
  customerName: string;
  loanNumber: string;
  totalAmount: number;
  method: string;
  paymentDate: string;
  officer: string;
  status: string; // CONFIRMED only if every split in the group is confirmed
  splits: Repayment[];
}

function groupByPayment(repayments: Repayment[]): GroupedPayment[] {
  const groups = new Map<string, Repayment[]>();
  for (const r of repayments) {
    const list = groups.get(r.transactionGroupId) ?? [];
    list.push(r);
    groups.set(r.transactionGroupId, list);
  }

  return Array.from(groups.entries())
    .map(([transactionGroupId, splits]) => {
      const first = splits[0];
      const allConfirmed = splits.every((s) => s.confirmationStatus === 'CONFIRMED');
      return {
        transactionGroupId,
        customerName: first.loan?.customer
          ? `${first.loan.customer.firstName} ${first.loan.customer.lastName}`
          : '—',
        loanNumber: first.loan?.loanNumber ?? '—',
        totalAmount: splits.reduce((sum, s) => sum + Number(s.amount), 0),
        method: first.paymentMethod,
        paymentDate: first.paymentDate,
        officer: first.receivedBy ? `${first.receivedBy.firstName} ${first.receivedBy.lastName}` : '—',
        status: allConfirmed ? 'CONFIRMED' : 'PENDING_VERIFICATION',
        splits,
      };
    })
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || name === '—') return '—';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

// Deterministic soft accent color for an avatar, derived from the name —
// keeps rows visually distinguishable at a glance without being random noise.
const AVATAR_HUES = [
  'bg-indigo-100 text-indigo-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];
function avatarHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_HUES.length;
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
}

type PaymentTab = 'CASH' | 'BANK_TRANSFER';

interface PaymentFormState {
  amount: string;
  paymentReference: string;
  remarks: string;
}

const initialPaymentForm: PaymentFormState = { amount: '', paymentReference: '', remarks: '' };

function toMoneyNumber(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export default function RepaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanSearch, setLoanSearch] = useState('');
  const [loanResults, setLoanResults] = useState<Loan[]>([]);
  const [loanSearchLoading, setLoanSearchLoading] = useState(false);
  const [tab, setTab] = useState<PaymentTab>('CASH');
  const [form, setForm] = useState<PaymentFormState>(initialPaymentForm);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingGroupId, setConfirmingGroupId] = useState<string | null>(null);

  const fetchRepayments = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.repayments.getAll(search ? { search } : undefined);
      if (response.success && response.data) {
        setRepayments(response.data);
      } else {
        setError(response.message || 'Failed to load repayments.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  useEffect(() => {
    const t = setTimeout(() => fetchRepayments(searchTerm || undefined), 350);
    return () => clearTimeout(t);
  }, [searchTerm, fetchRepayments]);

  useEffect(() => {
    if (!loanSearch) {
      setLoanResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setLoanSearchLoading(true);
        const res = await api.loans.getAll({ search: loanSearch });
        if (res.success && res.data) {
          setLoanResults(res.data.filter((l) => l.status === 'ACTIVE'));
        }
      } catch {
        // silent — search box, not a critical path
      } finally {
        setLoanSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [loanSearch]);

  function openModal() {
    setSelectedLoan(null);
    setLoanSearch('');
    setLoanResults([]);
    setTab('CASH');
    setForm(initialPaymentForm);
    setModalError('');
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLoan) {
      setModalError('Select a loan first.');
      return;
    }
    const amount = Number(form.amount);
    const outstandingBalance = toMoneyNumber(selectedLoan.outstandingBalance);
    if (!Number.isFinite(amount) || amount <= 0) {
      setModalError('Enter a valid amount.');
      return;
    }
    if (outstandingBalance <= 0) {
      setModalError('This loan has no outstanding balance to repay.');
      return;
    }
    if (amount > outstandingBalance) {
      setModalError(`Amount cannot exceed the outstanding balance of ${formatCurrency(outstandingBalance)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError('');
      const payload = {
        loanId: selectedLoan.id,
        amount,
        paymentReference: form.paymentReference || undefined,
        remarks: form.remarks || undefined,
      };
      if (tab === 'CASH') {
        await api.repayments.recordCash(payload);
      } else {
        await api.repayments.reportBankTransfer(payload);
      }
      setIsModalOpen(false);
      await fetchRepayments(searchTerm || undefined);
    } catch (err: any) {
      setModalError(err.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmGroup(group: GroupedPayment) {
    try {
      setConfirmingGroupId(group.transactionGroupId);
      // Bank transfers start as ONE pending row (confirmBankTransfer performs
      // the waterfall split at confirm time), so a pending group always has
      // exactly one split to confirm — but loop defensively regardless.
      for (const split of group.splits) {
        if (split.confirmationStatus === 'PENDING_VERIFICATION') {
          await api.repayments.confirm(split.id);
        }
      }
      await fetchRepayments(searchTerm || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment.');
    } finally {
      setConfirmingGroupId(null);
    }
  }

  function toggleExpand(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const formatCurrency = (amount: number | string) =>
    `₦${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const groups = useMemo(() => groupByPayment(repayments), [repayments]);

  const stats = useMemo(() => {
    const confirmed = groups.filter((g) => g.status === 'CONFIRMED');
    const pending = groups.filter((g) => g.status === 'PENDING_VERIFICATION');
    return {
      totalCollected: confirmed.reduce((sum, g) => sum + g.totalAmount, 0),
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, g) => sum + g.totalAmount, 0),
    };
  }, [groups]);

  return (
    <div className="space-y-6">
      <PageHeader title="Repayments" description="Track and manage loan repayment transactions" />

      {/* Summary strip — quick-glance financial context above the transaction list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <CircleCheck size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Confirmed collections</p>
            <p className="text-lg font-semibold text-foreground tabular-nums truncate">
              {loading ? '—' : formatCurrency(stats.totalCollected)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Clock3 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
            <p className="text-lg font-semibold text-foreground tabular-nums truncate">
              {loading ? '—' : formatCurrency(stats.pendingAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <Receipt size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total transactions</p>
            <p className="text-lg font-semibold text-foreground tabular-nums truncate">
              {loading ? '—' : groups.length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by loan number, customer, or receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90" onClick={openModal}>
            <Plus size={18} className="mr-2" />
            Record Payment
          </Button>
          <Button variant="outline" disabled title="Export not yet implemented">
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <RotateCw size={20} className="animate-spin" />
            <p className="text-sm">Loading repayments…</p>
          </div>
        ) : error ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => fetchRepayments(searchTerm || undefined)}
              className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Try again
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground mb-1">
              <Receipt size={20} />
            </div>
            <p className="text-sm font-medium text-foreground">No repayments found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {searchTerm
                ? `No transactions match "${searchTerm}". Try a different name.`
                : 'Payments recorded against loans will show up here.'}
            </p>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border bg-secondary/40">
                  <th className="py-3 pl-4 pr-2 w-[26%]">Customer</th>
                  <th className="py-3 px-2 w-[12%]">Loan</th>
                  <th className="py-3 px-2 w-[14%]">Amount</th>
                  <th className="py-3 px-2 w-[11%] hidden md:table-cell">Method</th>
                  <th className="py-3 px-2 w-[10%] hidden sm:table-cell">Date</th>
                  <th className="py-3 px-2 w-[10%] hidden lg:table-cell">Receipt #</th>
                  <th className="py-3 px-2 w-[9%] hidden xl:table-cell">Officer</th>
                  <th className="py-3 px-2 w-[10%]">Status</th>
                  <th className="py-3 pl-2 pr-4 w-[12%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.transactionGroupId);
                  const isMultiSplit = group.splits.length > 1;
                  const isConfirmed = group.status === 'CONFIRMED';
                  return (
                    <>
                      <tr
                        key={group.transactionGroupId}
                        className={`group border-b border-border last:border-0 border-l-2 transition-colors hover:bg-secondary/20 ${
                          isConfirmed ? 'border-l-indigo-400' : 'border-l-amber-400'
                        }`}
                      >
                        <td className="py-3 pl-4 pr-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarHue(
                                group.customerName
                              )}`}
                            >
                              {initials(group.customerName)}
                            </div>
                            <span className="text-foreground font-medium truncate">{group.customerName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-foreground truncate font-mono text-xs">{group.loanNumber}</td>
                        <td className="py-3 px-2">
                          <span className="font-semibold text-foreground tabular-nums">
                            {formatCurrency(group.totalAmount)}
                          </span>
                          {isMultiSplit && (
                            <span className="block text-xs text-muted-foreground font-normal">
                              {group.splits.length} installments
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-foreground truncate">
                            {group.method === 'CASH' ? (
                              <Wallet size={13} className="shrink-0 text-muted-foreground" />
                            ) : (
                              <Landmark size={13} className="shrink-0 text-muted-foreground" />
                            )}
                            {group.method === 'CASH' ? 'Cash' : 'Bank Transfer'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-foreground truncate hidden sm:table-cell">
                          {new Date(group.paymentDate).toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2 font-mono text-xs text-muted-foreground truncate hidden lg:table-cell">
                          {group.transactionGroupId.slice(0, 8)}…
                        </td>
                        <td className="py-3 px-2 text-foreground truncate hidden xl:table-cell">{group.officer}</td>
                        <td className="py-3 px-2">
                          <StatusBadge status={group.status.toLowerCase()} />
                        </td>
                        <td className="py-3 pl-2 pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {group.status === 'PENDING_VERIFICATION' ? (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleConfirmGroup(group)}
                                disabled={confirmingGroupId === group.transactionGroupId}
                              >
                                {confirmingGroupId === group.transactionGroupId ? (
                                  <RotateCw size={14} className="mr-1 animate-spin" />
                                ) : (
                                  <Check size={14} className="mr-1" />
                                )}
                                {confirmingGroupId === group.transactionGroupId ? 'Confirming…' : 'Confirm'}
                              </Button>
                            ) : !isMultiSplit ? (
                              <span className="text-muted-foreground text-xs">—</span>
                            ) : null}
                            {isMultiSplit && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(group.transactionGroupId)}
                                aria-expanded={isExpanded}
                                aria-label={
                                  isExpanded
                                    ? `Collapse ${group.splits.length} installments`
                                    : `Expand ${group.splits.length} installments`
                                }
                                title={isExpanded ? 'Hide installment breakdown' : 'Show installment breakdown'}
                                className={`group/toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                                  isExpanded
                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                              >
                                <ChevronRight
                                  size={15}
                                  className={`transition-transform duration-200 ease-out ${
                                    isExpanded ? 'rotate-90' : 'rotate-0 group-hover/toggle:translate-x-0.5'
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        group.splits.map((split, idx) => (
                          <tr key={split.id} className="border-b border-border last:border-0 bg-secondary/20">
                            <td className="py-2 pl-4 pr-2 text-xs text-muted-foreground truncate">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                                Installment {idx + 1}
                              </span>
                            </td>
                            <td className="py-2 px-2"></td>
                            <td className="py-2 px-2 text-xs text-foreground tabular-nums truncate">
                              {formatCurrency(Number(split.amount))}
                            </td>
                            <td className="py-2 px-2 hidden md:table-cell"></td>
                            <td className="py-2 px-2 hidden sm:table-cell text-xs text-muted-foreground truncate">
                              int {formatCurrency(Number(split.interestApplied))} · prin{' '}
                              {formatCurrency(Number(split.principalApplied))}
                            </td>
                            <td className="py-2 px-2 hidden lg:table-cell font-mono text-xs text-muted-foreground truncate">
                              {split.receiptNumber}
                            </td>
                            <td className="py-2 px-2 hidden xl:table-cell"></td>
                            <td className="py-2 px-2">
                              <StatusBadge status={split.confirmationStatus.toLowerCase()} />
                            </td>
                            <td className="py-2 pl-2 pr-4"></td>
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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="w-full max-w-lg rounded-xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {selectedLoan && (
                  <button
                    type="button"
                    onClick={() => setSelectedLoan(null)}
                    aria-label="Back to loan search"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedLoan ? 'Record Payment' : 'Find a Loan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!selectedLoan ? (
                <FormField label="Loan Number" required>
                  <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="e.g. LN-20260719-123456"
                      value={loanSearch}
                      onChange={(e) => setLoanSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="mt-2 max-h-56 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {loanSearchLoading ? (
                      <div className="p-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <RotateCw size={13} className="animate-spin" />
                        Searching…
                      </div>
                    ) : loanResults.length > 0 ? (
                      loanResults.map((loan) => {
                        const name = loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName}` : '—';
                        return (
                          <button
                            type="button"
                            key={loan.id}
                            onClick={() => setSelectedLoan(loan)}
                            className="w-full flex items-center gap-3 text-left p-3 hover:bg-secondary/60 transition-colors"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarHue(
                                name
                              )}`}
                            >
                              {initials(name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {loan.loanNumber} · Outstanding: {formatCurrency(loan.outstandingBalance)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : loanSearch ? (
                      <p className="p-4 text-xs text-muted-foreground text-center">
                        No active loan matches “{loanSearch}”.
                      </p>
                    ) : (
                      <p className="p-4 text-xs text-muted-foreground text-center">
                        Enter the loan number from the customer’s loan agreement or repayment notice.
                      </p>
                    )}
                  </div>
                </FormField>
              ) : (
                <>
                  <div className="rounded-lg bg-secondary/50 border border-border p-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarHue(
                        selectedLoan.customer
                          ? `${selectedLoan.customer.firstName} ${selectedLoan.customer.lastName}`
                          : '—'
                      )}`}
                    >
                      {initials(
                        selectedLoan.customer
                          ? `${selectedLoan.customer.firstName} ${selectedLoan.customer.lastName}`
                          : '—'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {selectedLoan.customer
                          ? `${selectedLoan.customer.firstName} ${selectedLoan.customer.lastName}`
                          : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedLoan.loanNumber} · Outstanding: {formatCurrency(selectedLoan.outstandingBalance)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLoan(null)}
                      className="shrink-0 text-xs text-primary hover:text-primary/80 underline underline-offset-2"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1 bg-secondary/30">
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                        tab === 'CASH'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setTab('CASH')}
                    >
                      <Wallet size={14} />
                      Cash Payment
                    </button>
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                        tab === 'BANK_TRANSFER'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setTab('BANK_TRANSFER')}
                    >
                      <Landmark size={14} />
                      Bank Transfer
                    </button>
                  </div>

                  {tab === 'BANK_TRANSFER' && (
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground italic bg-amber-50 border border-amber-200 rounded-md p-2.5">
                      <Clock3 size={13} className="shrink-0 mt-0.5 text-amber-600" />
                      Bank transfers are recorded as pending until an admin confirms them from the list.
                    </p>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {modalError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {modalError}
                      </div>
                    )}

                    <FormField label="Amount" required>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          ₦
                        </span>
                        <Input
                          className="pl-7"
                          type="number"
                          min="0"
                          max={toMoneyNumber(selectedLoan.outstandingBalance)}
                          step="0.01"
                          placeholder="0.00"
                          value={form.amount}
                          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Outstanding balance includes principal, interest, and fees: {formatCurrency(selectedLoan.outstandingBalance)}.
                      </p>
                    </FormField>

                    <FormField label="Payment Reference (optional)">
                      <Input
                        placeholder={tab === 'BANK_TRANSFER' ? 'Bank transaction ref' : 'Optional note'}
                        value={form.paymentReference}
                        onChange={(e) => setForm((f) => ({ ...f, paymentReference: e.target.value }))}
                      />
                    </FormField>

                    <FormField label="Remarks (optional)">
                      <Input
                        value={form.remarks}
                        onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                      />
                    </FormField>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border -mx-4 px-4 pb-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting && <RotateCw size={14} className="mr-2 animate-spin" />}
                        {isSubmitting
                          ? 'Submitting…'
                          : tab === 'CASH'
                          ? 'Record Cash Payment'
                          : 'Report Bank Transfer'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
