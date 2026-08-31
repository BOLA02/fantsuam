'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  History as HistoryIcon,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { SavingsSummary } from './_components/SavingsSummary';
import { TransactionModal } from './_components/TransactionModal';
import { TransactionHistoryModal } from './_components/TransactionHistoryModal';
import { api } from '../../../lib/api-routes';
import type {
  SavingsAccount,
  SavingsTransaction,
} from '../../../lib/api-types';

interface SummaryData {
  totalSavings: number;
  activeAccounts: number;
  todaysDeposits: number;
  todaysWithdrawals: number;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'FROZEN';

const currency = (value: number) =>
  `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const initials = (first?: string, last?: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '—';

const AVATAR_PALETTE = [
  { bg: '#eeeefa', fg: '#2c2a7a' },
  { bg: '#ecfdf5', fg: '#047857' },
  { bg: '#fef3f2', fg: '#b91c1c' },
  { bg: '#fffbeb', fg: '#b45309' },
  { bg: '#eeeefa', fg: '#3f3ca3' },
  { bg: '#fdf4ff', fg: '#a21caf' },
];
const avatarStyle = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  ACTIVE: { dot: '#10b981', bg: '#ecfdf5', text: '#065f46' },
  INACTIVE: { dot: '#94a3b8', bg: '#f1f5f9', text: '#475569' },
  FROZEN: { dot: '#2c2a7a', bg: '#eeeefa', text: '#2c2a7a' },
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
  };
};

export default function SavingsAdminPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyAccount, setHistoryAccount] = useState<SavingsAccount | null>(null);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalSavings: 0,
    activeAccounts: 0,
    todaysDeposits: 0,
    todaysWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
  const [transactionType, setTransactionType] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'PROVISION'>('DEPOSIT');

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    setLoading(true);
    try {
      const accountsJson = await api.savings.getAllAccounts();
      if (accountsJson.success) setAccounts(accountsJson.data.items ?? []);

      const summaryJson = await api.savings.getSummary();
      if (summaryJson.success) setSummary(summaryJson.data);
    } catch (error) {
      console.error('Failed to load savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (account: SavingsAccount, type: 'DEPOSIT' | 'WITHDRAWAL') => {
    setSelectedAccount(account);
    setTransactionType(type);
    setIsModalOpen(true);
  };

  const handleProvisionNewCore = () => {
    setSelectedAccount(null);
    setTransactionType('PROVISION');
    setIsModalOpen(true);
  };

  const openTransactionHistory = (account: SavingsAccount) => {
    setHistoryAccount(account);
    setIsHistoryOpen(true);
  };

  const filteredAccounts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return accounts.filter((acc) => {
      const matchesTerm =
        !term ||
        acc.accountNumber.toLowerCase().includes(term) ||
        `${acc.customer?.firstName ?? ''} ${acc.customer?.lastName ?? ''}`
          .toLowerCase()
          .includes(term);
      const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [accounts, searchTerm, statusFilter]);

  const hasAnyAccounts = accounts.length > 0;

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-[28px] font-display font-semibold text-[#2c2a7a]">
          Savings Vault Administration
        </h1>
        <p className="mt-1 text-sm text-[#5C5849]">
          Manage member savings accounts, record deposits and withdrawals, and review transaction history.
        </p>
      </div>

      {/* Summary cards */}
      <SavingsSummary summary={summary} fallbackCount={accounts.length} />

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-[#EDECE6] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[#EDECE6] p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                type="text"
                placeholder="Search account or member name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search savings accounts"
                className="w-full rounded-lg border border-[#e2e8f0] py-2.5 pl-9 pr-3 text-sm text-[#1e293b] outline-none transition focus:border-[#2c2a7a] focus:ring-2 focus:ring-[#2c2a7a]/15"
              />
            </div>

            <div className="relative w-full sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                aria-label="Filter by status"
                className="w-full appearance-none rounded-lg border border-[#e2e8f0] bg-white py-2.5 pl-3 pr-8 text-sm text-[#334155] outline-none transition focus:border-[#2c2a7a] focus:ring-2 focus:ring-[#2c2a7a]/15"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="FROZEN">Frozen</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </div>
          </div>

          <button
            onClick={handleProvisionNewCore}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#2c2a7a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#232167] active:bg-[#1c1a52]"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Savings Account
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <TableSkeleton />
        ) : filteredAccounts.length === 0 ? (
          <EmptyState hasAnyAccounts={hasAnyAccounts} onProvision={handleProvisionNewCore} />
        ) : (
          <>
            {/* Mobile / tablet: stacked cards, no table, no horizontal scroll */}
            <div className="divide-y divide-[#F5F5F3] md:hidden">
              {filteredAccounts.map((account) => (
                <MobileAccountCard
                  key={account.id}
                  account={account}
                  onDeposit={() => openModal(account, 'DEPOSIT')}
                  onWithdraw={() => openModal(account, 'WITHDRAWAL')}
                  onHistory={() => openTransactionHistory(account)}
                />
              ))}
            </div>

            {/* Desktop: fixed-layout table, columns sized to always fit the container */}
            <table className="hidden w-full table-fixed border-collapse text-left md:table">
              <colgroup>
                <col className="w-[26%]" />
                <col className="w-[14%]" />
                <col className="w-[24%]" />
                <col className="w-[13%]" />
                <col className="w-[23%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#EDECE6] bg-[#2c2a7a]/[0.06]">
                  <Th>Account</Th>
                  <Th>Balance</Th>
                  <Th>Last Activity</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const last = account.transactions?.[0];
                  const av = avatarStyle(
                    `${account.customer?.firstName ?? ''}${account.customer?.lastName ?? ''}`
                  );
                  const statusStyle = STATUS_STYLES[account.status] ?? STATUS_STYLES.INACTIVE;
                  const when = last ? formatDateTime(last.transactionDate) : null;

                  return (
                    <tr
                      key={account.id}
                      className="group border-b border-[#F5F5F3] transition-colors last:border-b-0 hover:bg-[#2c2a7a]/[0.04]"
                    >
                      {/* Account: avatar + name + code */}
                      <td className="px-4 py-4 lg:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{ backgroundColor: av.bg, color: av.fg }}
                          >
                            {initials(account.customer?.firstName, account.customer?.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[#1e293b]">
                              {account.customer?.firstName} {account.customer?.lastName}
                            </div>
                            <div className="mt-0.5 truncate font-mono text-xs text-[#94a3b8]">
                              {account.accountNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-4 lg:px-5">
                        <span className="block truncate font-semibold tabular-nums text-[#2c2a7a]">
                          {currency(account.balance)}
                        </span>
                      </td>

                      {/* Last Activity: type + amount + date, one column */}
                      <td className="px-4 py-4 lg:px-5">
                        {last && when ? (
                          <div className="flex items-start gap-2">
                            {last.transactionType === 'DEPOSIT' ? (
                              <ArrowDownCircle size={15} className="mt-0.5 shrink-0 text-[#059669]" />
                            ) : (
                              <ArrowUpCircle size={15} className="mt-0.5 shrink-0 text-[#dc2626]" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-1.5 truncate text-xs">
                                <span
                                  className="font-semibold"
                                  style={{
                                    color: last.transactionType === 'DEPOSIT' ? '#059669' : '#dc2626',
                                  }}
                                >
                                  {last.transactionType}
                                </span>
                                <span className="tabular-nums text-[#64748b]">
                                  {currency(last.amount)}
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-xs text-[#94a3b8]">
                                {when.date} · {when.time}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-[#94a3b8]">No transactions yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 lg:px-5">
                        <span
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: statusStyle.dot }}
                          />
                          {account.status}
                        </span>
                      </td>

                      {/* Actions: icon-only, tooltip via title, always fits */}
                      <td className="px-4 py-4 lg:px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <IconActionButton
                            label="Deposit"
                            icon={<ArrowDownCircle size={16} />}
                            color="#10b981"
                            onClick={() => openModal(account, 'DEPOSIT')}
                          />
                          <IconActionButton
                            label="Withdraw"
                            icon={<ArrowUpCircle size={16} />}
                            color="#ef4444"
                            onClick={() => openModal(account, 'WITHDRAWAL')}
                          />
                          <IconActionButton
                            label="History"
                            icon={<HistoryIcon size={16} />}
                            color="#2c2a7a"
                            onClick={() => openTransactionHistory(account)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {!loading && filteredAccounts.length > 0 && (
          <div className="border-t border-[#EDECE6] px-5 py-3 text-xs text-[#94a3b8]">
            Showing {filteredAccounts.length} of {accounts.length} account
            {accounts.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={selectedAccount}
        transactionType={transactionType}
        onSuccess={fetchSavingsData}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        account={historyAccount}
      />
    </div>
  );
}

/* ---------- small presentational helpers ---------- */

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#2c2a7a] lg:px-5 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function IconActionButton({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors hover:text-white"
      style={{ borderColor: color, color }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {icon}
    </button>
  );
}

function MobileAccountCard({
  account,
  onDeposit,
  onWithdraw,
  onHistory,
}: {
  account: SavingsAccount;
  onDeposit: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
}) {
  const last = account.transactions?.[0];
  const av = avatarStyle(`${account.customer?.firstName ?? ''}${account.customer?.lastName ?? ''}`);
  const statusStyle = STATUS_STYLES[account.status] ?? STATUS_STYLES.INACTIVE;
  const when = last ? formatDateTime(last.transactionDate) : null;

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: av.bg, color: av.fg }}
          >
            {initials(account.customer?.firstName, account.customer?.lastName)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#1e293b]">
              {account.customer?.firstName} {account.customer?.lastName}
            </div>
            <div className="mt-0.5 truncate font-mono text-xs text-[#94a3b8]">
              {account.accountNumber}
            </div>
          </div>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
          {account.status}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[#94a3b8]">Balance</span>
        <span className="font-semibold tabular-nums text-[#2c2a7a]">{currency(account.balance)}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[#94a3b8]">Last activity</span>
        {last && when ? (
          <div className="flex items-center gap-1.5 text-right">
            {last.transactionType === 'DEPOSIT' ? (
              <ArrowDownCircle size={14} className="shrink-0 text-[#059669]" />
            ) : (
              <ArrowUpCircle size={14} className="shrink-0 text-[#dc2626]" />
            )}
            <div>
              <div
                className="text-xs font-semibold"
                style={{ color: last.transactionType === 'DEPOSIT' ? '#059669' : '#dc2626' }}
              >
                {currency(last.amount)}
              </div>
              <div className="text-[11px] text-[#94a3b8]">{when.date} · {when.time}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-[#94a3b8]">No transactions yet</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onDeposit}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#10b981] px-2 py-2 text-xs font-semibold text-[#10b981] active:bg-[#10b981] active:text-white"
        >
          <ArrowDownCircle size={14} /> Deposit
        </button>
        <button
          onClick={onWithdraw}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#ef4444] px-2 py-2 text-xs font-semibold text-[#ef4444] active:bg-[#ef4444] active:text-white"
        >
          <ArrowUpCircle size={14} /> Withdraw
        </button>
        <button
          onClick={onHistory}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#2c2a7a] px-2 py-2 text-xs font-semibold text-[#2c2a7a] active:bg-[#2c2a7a] active:text-white"
        >
          <HistoryIcon size={14} /> History
        </button>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="mb-4 h-4 w-40 rounded bg-[#F5F5F3]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-3 flex items-center gap-4 rounded-lg border border-[#F5F5F3] p-4">
          <div className="h-9 w-9 rounded-full bg-[#F5F5F3]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/4 rounded bg-[#F5F5F3]" />
            <div className="h-3 w-1/6 rounded bg-[#F5F5F3]" />
          </div>
          <div className="h-3 w-20 rounded bg-[#F5F5F3]" />
          <div className="h-3 w-24 rounded bg-[#F5F5F3]" />
          <div className="h-6 w-16 rounded-full bg-[#F5F5F3]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasAnyAccounts,
  onProvision,
}: {
  hasAnyAccounts: boolean;
  onProvision: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F3]">
        <Inbox size={22} className="text-[#94a3b8]" />
      </div>
      {hasAnyAccounts ? (
        <>
          <p className="text-sm font-medium text-[#334155]">No accounts match your filters</p>
          <p className="text-sm text-[#94a3b8]">Try a different search term or status.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-[#334155]">No savings accounts yet</p>
          <p className="max-w-sm text-sm text-[#94a3b8]">
            Create the first savings account to start recording deposits and withdrawals.
          </p>
          <button
            onClick={onProvision}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#2c2a7a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#232167]"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Savings Account
          </button>
        </>
      )}
    </div>
  );
}