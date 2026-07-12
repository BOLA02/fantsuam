'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCw, Download, Plus, X, Check, ChevronDown, ChevronRight } from 'lucide-react';
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

type PaymentTab = 'CASH' | 'BANK_TRANSFER';

interface PaymentFormState {
  amount: string;
  paymentReference: string;
  remarks: string;
}

const initialPaymentForm: PaymentFormState = { amount: '', paymentReference: '', remarks: '' };

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
    if (!amount || amount <= 0) {
      setModalError('Enter a valid amount.');
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

  const formatCurrency = (amount: number) => `₦${Number(amount).toLocaleString()}`;
  const groups = groupByPayment(repayments);

  return (
    <div className="space-y-6">
      <PageHeader title="Repayments" description="Track and manage loan repayment transactions" />

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openModal}>
          <Plus size={18} className="mr-2" />
          Record Payment
        </Button>
        <Button variant="outline" disabled title="Export not yet implemented">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading repayments...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">No repayments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border bg-secondary/30">
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Loan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Officer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.transactionGroupId);
                  const isMultiSplit = group.splits.length > 1;
                  return (
                    <>
                      <tr key={group.transactionGroupId} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">
                          {isMultiSplit && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(group.transactionGroupId)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground">{group.customerName}</td>
                        <td className="py-3 px-4 text-foreground">{group.loanNumber}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {formatCurrency(group.totalAmount)}
                          {isMultiSplit && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                              ({group.splits.length} installments)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground">{group.method}</td>
                        <td className="py-3 px-4 text-foreground">
                          {new Date(group.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground">
                          {group.transactionGroupId}
                        </td>
                        <td className="py-3 px-4 text-foreground">{group.officer}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={group.status.toLowerCase()} />
                        </td>
                        <td className="py-3 px-4">
                          {group.status === 'PENDING_VERIFICATION' ? (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleConfirmGroup(group)}
                              disabled={confirmingGroupId === group.transactionGroupId}
                            >
                              <Check size={14} className="mr-1" />
                              {confirmingGroupId === group.transactionGroupId ? 'Confirming...' : 'Confirm'}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded &&
                        group.splits.map((split) => (
                          <tr key={split.id} className="border-b border-border last:border-0 bg-secondary/20">
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4 text-xs text-muted-foreground" colSpan={2}>
                              Installment applied
                            </td>
                            <td className="py-2 px-4 text-xs text-foreground">
                              {formatCurrency(Number(split.amount))}
                              <span className="text-muted-foreground">
                                {' '}
                                (int {formatCurrency(Number(split.interestApplied))} · prin{' '}
                                {formatCurrency(Number(split.principalApplied))})
                              </span>
                            </td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4 font-mono text-xs text-muted-foreground">
                              {split.receiptNumber}
                            </td>
                            <td className="py-2 px-4"></td>
                            <td className="py-2 px-4">
                              <StatusBadge status={split.confirmationStatus.toLowerCase()} />
                            </td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-card border border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Record Payment</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!selectedLoan ? (
                <FormField label="Search Loan by Customer Name" required>
                  <Input
                    placeholder="Type a customer name..."
                    value={loanSearch}
                    onChange={(e) => setLoanSearch(e.target.value)}
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                    {loanSearchLoading ? (
                      <p className="p-3 text-xs text-muted-foreground">Searching...</p>
                    ) : loanResults.length > 0 ? (
                      loanResults.map((loan) => (
                        <button
                          type="button"
                          key={loan.id}
                          onClick={() => setSelectedLoan(loan)}
                          className="w-full text-left p-3 hover:bg-muted text-sm"
                        >
                          <p className="font-medium text-foreground">
                            {loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName}` : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.loanNumber} · Outstanding: {formatCurrency(loan.outstandingBalance)}
                          </p>
                        </button>
                      ))
                    ) : loanSearch ? (
                      <p className="p-3 text-xs text-muted-foreground">No active loans found.</p>
                    ) : null}
                  </div>
                </FormField>
              ) : (
                <>
                  <div className="rounded-lg bg-muted p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {selectedLoan.customer
                          ? `${selectedLoan.customer.firstName} ${selectedLoan.customer.lastName}`
                          : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLoan.loanNumber} · Outstanding: {formatCurrency(selectedLoan.outstandingBalance)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLoan(null)}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium ${
                        tab === 'CASH' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'
                      }`}
                      onClick={() => setTab('CASH')}
                    >
                      Cash Payment
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium ${
                        tab === 'BANK_TRANSFER'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-transparent text-muted-foreground'
                      }`}
                      onClick={() => setTab('BANK_TRANSFER')}
                    >
                      Bank Transfer
                    </button>
                  </div>

                  {tab === 'BANK_TRANSFER' && (
                    <p className="text-xs text-muted-foreground italic">
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
                      <Input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        required
                      />
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

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting
                          ? 'Submitting...'
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