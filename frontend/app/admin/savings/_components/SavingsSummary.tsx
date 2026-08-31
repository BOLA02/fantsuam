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
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #EDECE6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#5C5849', fontWeight: '500' }}>Total Portfolio Savings</span>
        <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', color: '#2c2a7a' }}>
          ₦{Number(summary.totalSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '12px', color: '#10b981' }}>Cumulative system deposits balance</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #EDECE6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#5C5849', fontWeight: '500' }}>Operational Vault Pools</span>
        <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', color: '#2b2b28' }}>
          {summary.activeAccounts || fallbackCount}
        </div>
        <span style={{ fontSize: '12px', color: '#8A8677' }}>Active member ledger accounts</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #EDECE6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#5C5849', fontWeight: '500' }}>Deposits Today</span>
        <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', color: '#2c2a7a' }}>
          ₦{Number(summary.todaysDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '12px', color: '#8A8677' }}>Real-time rolling counter operations</span>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #EDECE6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '14px', color: '#5C5849', fontWeight: '500' }}>Withdrawals Today</span>
        <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', color: '#ef4444' }}>
          ₦{Number(summary.todaysWithdrawals || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '12px', color: '#8A8677' }}>Real-time rolling counter operations</span>
      </div>
    </div>
  );
};