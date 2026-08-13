'use client';

import React from 'react';

interface SummaryData {
  totalSavings: number;
  activeAccounts: number;
  todaysDeposits: number;
  todaysWithdrawals: number;
}

interface SavingsSummaryProps {
  summary: SummaryData;
  fallbackCount: number;
}

export const SavingsSummary: React.FC<SavingsSummaryProps> = ({ summary, fallbackCount }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#65758a', fontWeight: '500' }}>Total Portfolio Savings</span>
        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#111827' }}>
          ₦{Number(summary.totalSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '12px', color: '#10b981' }}>Cumulative system deposits balance</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#65758a', fontWeight: '500' }}>Operational Vault Pools</span>
        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#111827' }}>
          {summary.activeAccounts || fallbackCount}
        </div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Active member ledger accounts</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#65758a', fontWeight: '500' }}>Deposits Today</span>
        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#3b82f6' }}>
          ₦{Number(summary.todaysDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Real-time rolling counter operations</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#65758a', fontWeight: '500' }}>Withdrawals Today</span>
        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', color: '#ef4444' }}>
          ₦{Number(summary.todaysWithdrawals || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Real-time rolling counter operations</span>
      </div>
    </div>
  );
};