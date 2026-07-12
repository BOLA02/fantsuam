'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCw, Download, Plus, X, Check } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/form';
import { api } from '@/lib/api-routes';
import { Repayment, Loan } from '@/lib/api-types';

interface RepaymentRow {
  id: string;
  customerName: string;
  loanNumber: string;
  amount: number;
  interestApplied: number;
  principalApplied: number;
  method: string;
  paymentDate: string;
  receiptNumber: string;
  officer: string;
  status: string;
}

function toRow(rep: Repayment): RepaymentRow {
  return {
    id: rep.id,
    customerName: rep.loan?.customer ? `${rep.loan.customer.firstName} ${rep.loan.customer.lastName}` : '—',
    loanNumber: rep.loan?.loanNumber ?? '—',
    amount: rep.amount,
    interestApplied: rep.interestApplied,
    principalApplied: rep.principalApplied,
    method: rep.paymentMethod,
    paymentDate: new Date(rep.paymentDate).toLocaleDateString(),
    receiptNumber: rep.receiptNumber,
    officer: rep.receivedBy ? `${rep.receivedBy.firstName} ${rep.receivedBy.lastName}` : '—',
    status: rep.confirmationStatus,
  };
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
  const [repayments, setRepayments] = useState<RepaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanSearch, setLoanSearch] = useState('');
  const [loanResults, setLoanResults] = useState<Loan[]>([]);
  const [loanSearchLoading, setLoanSearchLoading] = useState(false);
  const [tab, setTab] = useState<PaymentTab>('CASH');
  const [form, setForm] = useState<PaymentFormState>(initialPaymentForm);
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchRepayments = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.repayments.getAll(search ? { search } : undefined);
      if (response.success && response.data) {
        setRepayments(response.data.map(toRow));
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

  // Debounced loan search inside the modal
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

  async function handleConfirm(id: string) {
    try {
      setConfirmingId(id);
      await api.repayments.confirm(id);
      await fetchRepayments(searchTerm || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment.');
    } finally {
      setConfirmingId(null);
    }
  }

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const columns: Column<RepaymentRow>[] = [
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'loanNumber', header: 'Loan', sortable: true },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'interestApplied',
      header: 'Interest',
      sortable: true,
      cell: (row) => formatCurrency(row.interestApplied),
    },
    {
      key: 'principalApplied',
      header: 'Principal',
      sortable: true,
      cell: (row) => formatCurrency(row.principalApplied),
    },
    { key: 'method', header: 'Method', sortable: true },
    { key: 'paymentDate', header: 'Date', sortable: true },
    { key: 'receiptNumber', header: 'Receipt #', sortable: true },
    { key: 'officer', header: 'Officer', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
    {
      key: 'id',
      header: 'Actions',
      cell: (row) =>
        row.status === 'PENDING_VERIFICATION' ? (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => handleConfirm(row.id)}
            disabled={confirmingId === row.id}
          >
            <Check size={14} className="mr-1" />
            {confirmingId === row.id ? 'Confirming...' : 'Confirm'}
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
  ];

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

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading repayments...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : (
          <DataTable data={repayments} columns={columns} emptyMessage="No repayments found" />
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
                            {loan.loanNumber} · Outstanding: ₦{loan.outstandingBalance.toLocaleString()}
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
                        {selectedLoan.loanNumber} · Outstanding: ₦{selectedLoan.outstandingBalance.toLocaleString()}
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