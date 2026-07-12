'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';

import { api } from '@/lib/api-routes';
import { Loan, LedgerEntry } from '@/lib/api-types';
import { Input, Select, FormField } from '@/components/form';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';

interface DisburseFormState {
  amount: string;
  paymentMethod: PaymentMethod;
  accountName: string;
  accountNumber: string;
  bankName: string;
  remarks: string;
}

const initialDisburseForm: DisburseFormState = {
  amount: '',
  paymentMethod: 'BANK_TRANSFER',
  accountName: '',
  accountNumber: '',
  bankName: '',
  remarks: '',
};

export default function LoanDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [disburseForm, setDisburseForm] = useState<DisburseFormState>(initialDisburseForm);
  const [disburseError, setDisburseError] = useState('');
  const [isSubmittingDisburse, setIsSubmittingDisburse] = useState(false);

  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState('');

  async function loadLoan(loanId: string) {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.loans.getById(loanId);
      setLoan(res.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load loan record.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLedger(loanId: string) {
    try {
      setIsLedgerLoading(true);
      setLedgerError('');
      const res = await api.ledger.getForLoan(loanId);
      setLedger(res.data ?? []);
    } catch (err: any) {
      setLedgerError(err.message || 'Failed to load payment ledger.');
    } finally {
      setIsLedgerLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    loadLoan(id);
    loadLedger(id);
  }, [id]);

  function openDisburseModal() {
    if (loan) {
      setDisburseForm({ ...initialDisburseForm, amount: String(loan.approvedAmount) });
    }
    setDisburseError('');
    setIsDisburseOpen(true);
  }

  async function handleDisburseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    const amount = Number(disburseForm.amount);
    if (!amount || amount <= 0) {
      setDisburseError('Enter a valid disbursement amount.');
      return;
    }

    try {
      setIsSubmittingDisburse(true);
      setDisburseError('');
      await api.loans.disburse(id, {
        amount,
        paymentMethod: disburseForm.paymentMethod,
        accountName: disburseForm.accountName || undefined,
        accountNumber: disburseForm.accountNumber || undefined,
        bankName: disburseForm.bankName || undefined,
        remarks: disburseForm.remarks || undefined,
      });
      setIsDisburseOpen(false);
      await loadLoan(id);
      await loadLedger(id);
    } catch (err: any) {
      setDisburseError(err.message || 'Failed to disburse loan.');
    } finally {
      setIsSubmittingDisburse(false);
    }
  }

  const sectionClassName = 'rounded-lg border border-border bg-card p-6';
  const sectionTitleClassName = 'text-sm font-semibold text-foreground mb-4';
  const fieldLabelClassName = 'text-xs text-muted-foreground';
  const fieldValueClassName = 'text-sm text-foreground font-medium';

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString() : '—');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/loans"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft size={16} />
            Back to Loans
          </Link>
          <PageHeader
            title={loan ? loan.loanNumber : 'Loan Details'}
            description={
              loan
                ? `${loan.customer ? `${loan.customer.firstName} ${loan.customer.lastName}` : '—'} · ${loan.loanProduct?.name ?? ''}`
                : 'View loan status, schedule, and payment history.'
            }
          />
        </div>

        {loan && loan.status === 'PENDING_DISBURSEMENT' && (
          <Button className="bg-primary hover:bg-primary/90" onClick={openDisburseModal}>
            Disburse Loan
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Notice: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className={sectionClassName}>
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#2E3192]" />
            <p className="text-xs text-muted-foreground">Loading loan record...</p>
          </div>
        </div>
      ) : !loan ? (
        !error && (
          <div className={sectionClassName}>
            <p className="text-sm text-muted-foreground">Loan not found.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Summary */}
          <div className={`${sectionClassName} lg:col-span-2`}>
            <h3 className={sectionTitleClassName}>Loan Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={fieldLabelClassName}>Loan Number</p>
                <p className={`${fieldValueClassName} font-mono`}>{loan.loanNumber}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Status</p>
                <p className={fieldValueClassName}>
                  <StatusBadge status={loan.status.toLowerCase()} />
                </p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Principal Amount</p>
                <p className={fieldValueClassName}>{formatCurrency(loan.principalAmount)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Approved Amount</p>
                <p className={fieldValueClassName}>{formatCurrency(loan.approvedAmount)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Disbursed Amount</p>
                <p className={fieldValueClassName}>{formatCurrency(loan.disbursedAmount)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Total Payable</p>
                <p className={fieldValueClassName}>{formatCurrency(loan.totalPayable)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Outstanding Balance</p>
                <p className={fieldValueClassName}>{formatCurrency(loan.outstandingBalance)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Interest Rate</p>
                <p className={fieldValueClassName}>{loan.interestRate}%</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Processing Fee</p>
                <p className={fieldValueClassName}>{formatCurrency(loan.processingFee)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Duration</p>
                <p className={fieldValueClassName}>{loan.durationMonths} months</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Repayment Frequency</p>
                <p className={fieldValueClassName}>{loan.repaymentFrequency}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Approval Date</p>
                <p className={fieldValueClassName}>{formatDate(loan.approvalDate)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Disbursement Date</p>
                <p className={fieldValueClassName}>{formatDate(loan.disbursementDate)}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Maturity Date</p>
                <p className={fieldValueClassName}>{formatDate(loan.maturityDate)}</p>
              </div>
            </div>
            {loan.remarks && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className={fieldLabelClassName}>Remarks</p>
                <p className={fieldValueClassName}>{loan.remarks}</p>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Customer</h3>
            {loan.customer ? (
              <div className="space-y-3">
                <div>
                  <p className={fieldLabelClassName}>Name</p>
                  <Link
                    href={`/admin/customers/${loan.customer.id}`}
                    className={`${fieldValueClassName} text-[#2E3192] hover:underline`}
                  >
                    {loan.customer.firstName} {loan.customer.lastName}
                  </Link>
                </div>
                {loan.customer.phone && (
                  <div>
                    <p className={fieldLabelClassName}>Phone</p>
                    <p className={fieldValueClassName}>{loan.customer.phone}</p>
                  </div>
                )}
                {loan.customer.email && (
                  <div>
                    <p className={fieldLabelClassName}>Email</p>
                    <p className={fieldValueClassName}>{loan.customer.email}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No customer on file.</p>
            )}
          </div>

          {/* Repayment Schedule */}
          <div className={`${sectionClassName} lg:col-span-3`}>
            <h3 className={sectionTitleClassName}>Repayment Schedule</h3>
            {loan.schedules && loan.schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">Due Date</th>
                      <th className="py-2 pr-4">Principal</th>
                      <th className="py-2 pr-4">Interest</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Paid</th>
                      <th className="py-2 pr-4">Balance</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.schedules.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 text-foreground">{s.installmentNumber}</td>
                        <td className="py-2 pr-4 text-foreground">{formatDate(s.dueDate)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCurrency(s.principalAmount)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCurrency(s.interestAmount)}</td>
                        <td className="py-2 pr-4 text-foreground font-semibold">{formatCurrency(s.totalAmount)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCurrency(s.paidAmount)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCurrency(s.balance)}</td>
                        <td className="py-2 pr-4">
                          <StatusBadge status={s.status.toLowerCase()} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No repayment schedule yet — generated on disbursement.
              </p>
            )}
          </div>

          {/* Payment Ledger */}
          <div className={`${sectionClassName} lg:col-span-3`}>
            <h3 className={sectionTitleClassName}>Payment Ledger</h3>
            {isLedgerLoading ? (
              <p className="text-sm text-muted-foreground">Loading ledger...</p>
            ) : ledgerError ? (
              <p className="text-sm text-destructive">{ledgerError}</p>
            ) : ledger.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Narration</th>
                      <th className="py-2 pr-4">Debit</th>
                      <th className="py-2 pr-4">Credit</th>
                      <th className="py-2 pr-4">Balance</th>
                      <th className="py-2 pr-4">Ledger #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => (
                      <tr key={entry.id} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 text-foreground">{formatDate(entry.transaction.transactionDate)}</td>
                        <td className="py-2 pr-4 text-foreground">{entry.narration}</td>
                        <td className="py-2 pr-4 text-foreground">{entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</td>
                        <td className="py-2 pr-4 text-foreground">{entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</td>
                        <td className="py-2 pr-4 text-foreground font-semibold">{formatCurrency(entry.balance)}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-foreground">{entry.ledgerNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No ledger entries yet.</p>
            )}
          </div>

          {/* Disbursements */}
          <div className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Disbursements</h3>
            {loan.disbursements && loan.disbursements.length > 0 ? (
              <div className="space-y-3">
                {loan.disbursements.map((d) => (
                  <div key={d.id} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-foreground">{formatCurrency(d.amount)}</p>
                    <p className="text-muted-foreground">{d.paymentMethod} · {d.referenceNumber}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(d.disbursedAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not yet disbursed.</p>
            )}
          </div>

          {/* Repayments */}
          <div className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Repayments</h3>
            {loan.repayments && loan.repayments.length > 0 ? (
              <div className="space-y-3">
                {loan.repayments.map((r) => (
                  <div key={r.id} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-foreground">{formatCurrency(r.amount)}</p>
                    <p className="text-muted-foreground">{r.paymentMethod} · {r.receiptNumber}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(r.paymentDate)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No repayments recorded.</p>
            )}
          </div>

          {/* Status History */}
          <div className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Status History</h3>
            {loan.statusHistory && loan.statusHistory.length > 0 ? (
              <div className="space-y-3">
                {loan.statusHistory.map((h) => (
                  <div key={h.id} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-foreground">{h.status}</p>
                    {h.remarks && <p className="text-muted-foreground">{h.remarks}</p>}
                    <p className="text-muted-foreground text-xs">{formatDate(h.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No history recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Disburse Modal — inline, since no existing Dialog component was confirmed. */}
      {isDisburseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Disburse Loan</h3>
              <button
                type="button"
                onClick={() => setIsDisburseOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisburseSubmit} className="p-4 space-y-4">
              {disburseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {disburseError}
                </div>
              )}

              <FormField label="Amount" required>
                <Input
                  type="number"
                  value={disburseForm.amount}
                  onChange={(e) => setDisburseForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Payment Method" required>
                <Select
                  value={disburseForm.paymentMethod}
                  onChange={(e) =>
                    setDisburseForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))
                  }
                  options={[
                    { value: 'CASH', label: 'Cash' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                    { value: 'POS', label: 'POS' },
                    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
                  ]}
                />
              </FormField>

              {disburseForm.paymentMethod === 'BANK_TRANSFER' && (
                <>
                  <FormField label="Account Name">
                    <Input
                      value={disburseForm.accountName}
                      onChange={(e) => setDisburseForm((f) => ({ ...f, accountName: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Account Number">
                    <Input
                      value={disburseForm.accountNumber}
                      onChange={(e) => setDisburseForm((f) => ({ ...f, accountNumber: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Bank Name">
                    <Input
                      value={disburseForm.bankName}
                      onChange={(e) => setDisburseForm((f) => ({ ...f, bankName: e.target.value }))}
                    />
                  </FormField>
                </>
              )}

              <FormField label="Remarks (optional)">
                <Input
                  value={disburseForm.remarks}
                  onChange={(e) => setDisburseForm((f) => ({ ...f, remarks: e.target.value }))}
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDisburseOpen(false)}
                  disabled={isSubmittingDisburse}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmittingDisburse}>
                  {isSubmittingDisburse ? 'Disbursing...' : 'Confirm Disbursement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}