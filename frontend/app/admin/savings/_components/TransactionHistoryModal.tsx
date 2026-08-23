'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api-routes';
import type { SavingsTransaction } from '../../../../lib/api-types';

// interface SavingsTransaction {
//   id: string;
//   transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT';
//   amount: number;
//   balanceBefore: number;
//   balanceAfter: number;
//   paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
//   description?: string | null;
//   reference: string;
//   transactionDate: string;
// }

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    accountNumber: string;
    customer: {
      firstName: string;
      lastName: string;
    };
    balance: number;
  } | null;
}

export function TransactionHistoryModal({
  isOpen,
  onClose,
  account,
}: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (!isOpen || !account) return;

    loadTransactions();
  }, [isOpen, account, page]);

  const loadTransactions = async () => {
    if (!account) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.savings.getTransactions(
        account.id,
        page,
        pageSize
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to load transaction history'
        );
      }

      setTransactions(response.data.items ?? []);
      setTotal(response.data.total ?? 0);
    } catch (err) {
      console.error('Failed to load transaction history:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load transaction history'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !account) return null;

  const formatMoney = (value: number) =>
    `₦${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDateTime = (date: string) => {
    const value = new Date(date);

    return (
      <div>
        <div style={{ fontWeight: 500, color: '#334155' }}>
          {value.toLocaleDateString()}
        </div>

        <div
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '2px',
          }}
        >
          {value.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    );
  };

  const getTypeStyle = (type: SavingsTransaction['transactionType']) => {
    if (type === 'DEPOSIT') {
      return {
        backgroundColor: '#ecfdf5',
        color: '#047857',
      };
    }

    if (type === 'WITHDRAWAL') {
      return {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
      };
    }

    return {
      backgroundColor: '#f1f5f9',
      color: '#475569',
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '22px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '21px',
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Transaction History
            </h2>

            <div
              style={{
                marginTop: '6px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                {account.accountNumber}
              </span>

              <span style={{ color: '#cbd5e1' }}>•</span>

              <span style={{ color: '#64748b' }}>
                {account.customer.firstName}{' '}
                {account.customer.lastName}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '25px',
              color: '#64748b',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ACCOUNT SUMMARY */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '40px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '4px',
              }}
            >
              Current Balance
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#0f766e',
              }}
            >
              {formatMoney(account.balance)}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '4px',
              }}
            >
              Total Transactions
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#334155',
              }}
            >
              {total}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              Loading transaction history...
            </div>
          ) : error ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#dc2626',
                  marginBottom: '12px',
                }}
              >
                {error}
              </div>

              <button
                onClick={loadTransactions}
                style={{
                  padding: '8px 14px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              No transactions have been recorded for this account.
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <tr
                  style={{
                    backgroundColor: '#fafbfd',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <th style={headerStyle}>Date & Time</th>
                  <th style={headerStyle}>Transaction</th>
                  <th style={headerStyle}>Reference</th>
                  <th style={headerStyle}>Amount</th>
                  <th style={headerStyle}>Balance Before</th>
                  <th style={headerStyle}>Balance After</th>
                  <th style={headerStyle}>Payment Method</th>
                  <th style={headerStyle}>Description</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const isDeposit =
                    transaction.transactionType === 'DEPOSIT';

                  return (
                    <tr
                      key={transaction.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <td style={cellStyle}>
                        {formatDateTime(
                          transaction.transactionDate
                        )}
                      </td>

                      <td style={cellStyle}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '5px 9px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            ...getTypeStyle(
                              transaction.transactionType
                            ),
                          }}
                        >
                          {transaction.transactionType}
                        </span>
                      </td>

                      <td
                        style={{
                          ...cellStyle,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {transaction.reference}
                      </td>

                      <td
                        style={{
                          ...cellStyle,
                          fontWeight: 700,
                          color: isDeposit
                            ? '#047857'
                            : '#dc2626',
                        }}
                      >
                        {isDeposit ? '+' : '-'}
                        {formatMoney(transaction.amount)}
                      </td>

                      <td style={cellStyle}>
                        {formatMoney(
                          transaction.balanceBefore
                        )}
                      </td>

                      <td
                        style={{
                          ...cellStyle,
                          fontWeight: 600,
                        }}
                      >
                        {formatMoney(
                          transaction.balanceAfter
                        )}
                      </td>

                      <td style={cellStyle}>
                        {transaction.paymentMethod.replace(
                          '_',
                          ' '
                        )}
                      </td>

                      <td
                        style={{
                          ...cellStyle,
                          color: '#64748b',
                          maxWidth: '200px',
                        }}
                      >
                        {transaction.description || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER / PAGINATION */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            {total === 0
              ? 'No transactions'
              : `Showing ${
                  (page - 1) * pageSize + 1
                }–${Math.min(
                  page * pageSize,
                  total
                )} of ${total}`}
          </span>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              style={paginationButtonStyle(
                page <= 1 || loading
              )}
            >
              Previous
            </button>

            <span
              style={{
                fontSize: '13px',
                color: '#475569',
                padding: '0 8px',
              }}
            >
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              style={paginationButtonStyle(
                page >= totalPages || loading
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '13px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
  whiteSpace: 'nowrap',
};

const cellStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '13px',
  color: '#334155',
};

const paginationButtonStyle = (
  disabled: boolean
): React.CSSProperties => ({
  padding: '7px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: disabled ? '#f8fafc' : '#fff',
  color: disabled ? '#94a3b8' : '#334155',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '12px',
});