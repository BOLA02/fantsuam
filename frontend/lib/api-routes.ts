// lib/api.ts
// FULL FILE — UPDATED: added loanApplications, guarantors, documents

import { apiClient } from './api-client';
import {
  ApiResponse,
  Customer,
  Branch,
  LoanProduct,
  LoanApplication,
  Guarantor,
  DocumentRecord,
  Loan,
  Repayment,
  LedgerEntry,
  SmsLog,
  SmsTemplateOption

} from './api-types';

export const api = {
  applicationFee: {
    getConfig: async () => apiClient<ApiResponse<{ enabled: boolean; amount: number; currency: 'NGN' }>>('/application-fee/config'),
    initialize: async (email: string) =>
      apiClient<ApiResponse<{ authorizationUrl: string }>>('/application-fee/initialize', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verify: async (reference: string) =>
      apiClient<ApiResponse<{ token: string }>>(`/application-fee/verify/${encodeURIComponent(reference)}`),
  },

  auth: {
    login: async (body: Record<string, string>) => {
      return apiClient<ApiResponse<{ token: string; user: any }>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  },

  branches: {
    getAll: async () => {
      return apiClient<ApiResponse<Branch[]>>('/branches');
    },
  },

  customers: {
    getAll: async () => {
      return apiClient<ApiResponse<Customer[]>>('/customers', { cache: 'no-store' });
    },
    getById: async (id: string) => {
      return apiClient<ApiResponse<Customer>>(`/customers/${id}`);
    },
    search: async (keyword: string) => {
      return apiClient<ApiResponse<Customer[]>>(`/customers/search?q=${encodeURIComponent(keyword)}`);
    },
    create: async (payload: any) => {
      return apiClient<ApiResponse<Customer>>('/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (id: string, payload: any) => {
      return apiClient<ApiResponse<Customer>>(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: string) => {
      return apiClient<ApiResponse<any>>(`/customers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  users: {
    getAll: async () => {
      return apiClient<ApiResponse<any[]>>('/users', { cache: 'no-store' });
    },
    getById: async (id: string) => {
      return apiClient<ApiResponse<any>>(`/users/${id}`);
    },
    create: async (payload: any) => {
      return apiClient<ApiResponse<any>>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (id: string, payload: any) => {
      return apiClient<ApiResponse<any>>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    changeStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
      return apiClient<ApiResponse<any>>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    resetPassword: async (id: string, payload: any) => {
      return apiClient<ApiResponse<any>>(`/users/${id}/reset-password`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: string) => {
      return apiClient<ApiResponse<any>>(`/users/${id}`, {
        method: 'DELETE',
      });
    },
  },

 loanProducts: {
    getAll: async () => {
      return apiClient<ApiResponse<LoanProduct[]>>('/loan-products');
    },
    getById: async (id: string) => {
      return apiClient<ApiResponse<LoanProduct>>(`/loan-products/${id}`);
    },
    create: async (payload: any) => {
      return apiClient<ApiResponse<LoanProduct>>('/loan-products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (id: string, payload: any) => {
      return apiClient<ApiResponse<LoanProduct>>(`/loan-products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    toggle: async (id: string, isActive: boolean) => {
      return apiClient<ApiResponse<LoanProduct>>(`/loan-products/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    delete: async (id: string) => {
      return apiClient<ApiResponse<any>>(`/loan-products/${id}`, {
        method: 'DELETE',
      });
    },
  },
loanApplications: {
  getAll: async (params?: {
    status?: string;
    customerId?: string;
    loanProductId?: string;
    assignedOfficerId?: string;
  }) => {
    const query = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
      : '';
    return apiClient<ApiResponse<LoanApplication[]>>(`/loan-applications${query}`);
  },
  getById: async (id: string) => {
    return apiClient<ApiResponse<LoanApplication>>(`/loan-applications/${id}`);
  },
  create: async (payload: {
    customerId: string;
    loanProductId: string;
    requestedAmount: number;
    purpose: string;
    durationMonths: number;
    remarks?: string;
  }) => {
    return apiClient<ApiResponse<LoanApplication>>('/loan-applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  changeStatus: async (id: string, status: string, remarks?: string) => {
    return apiClient<ApiResponse<LoanApplication>>(`/loan-applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  },
},

 guarantors: {
  getAll: async (customerId: string) => {
    return apiClient<ApiResponse<Guarantor[]>>(`/guarantors?customerId=${encodeURIComponent(customerId)}`);
  },
  create: async (payload: {
    customerId: string;
    fullName: string;
    relationship: string;
    phone: string;
    email?: string;
    occupation?: string;
    address: string;
  }) => {
    return apiClient<ApiResponse<Guarantor>>('/guarantors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
},

  documents: {
    upload: async (formData: FormData) => {
      return apiClient<ApiResponse<DocumentRecord>>('/documents', {
        method: 'POST',
        body: formData,
      });
    },
  },

 loans: {
    getAll: async (params?: { search?: string }) => {
      const query = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
      return apiClient<ApiResponse<Loan[]>>(`/loans${query}`);
    },
    getById: async (id: string) => {
      return apiClient<ApiResponse<Loan>>(`/loans/${id}`);
    },
    disburse: async (
      id: string,
      payload: {
        amount: number;
        paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        remarks?: string;
      }
    ) => {
      return apiClient<ApiResponse<Loan>>(`/loans/${id}/disburse`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  },

  repayments: {
    getAll: async (params?: { search?: string; status?: string; loanId?: string }) => {
      const query = params
        ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
        : '';
      return apiClient<ApiResponse<Repayment[]>>(`/repayments${query}`);
    },
    getLedger: async (loanId: string) => {
      return apiClient<ApiResponse<Repayment[]>>(`/repayments/ledger/${loanId}`);
    },
    recordCash: async (payload: { loanId: string; amount: number; paymentReference?: string; remarks?: string }) => {
      return apiClient<ApiResponse<Repayment[]>>('/repayments/cash', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    reportBankTransfer: async (payload: {
      loanId: string;
      amount: number;
      paymentReference?: string;
      remarks?: string;
    }) => {
      return apiClient<ApiResponse<Repayment>>('/repayments/bank-transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    confirm: async (id: string) => {
      return apiClient<ApiResponse<Repayment>>(`/repayments/${id}/confirm`, {
        method: 'PATCH',
      });
    },
  },


  ledger: {
    getAll: async (params?: { search?: string; loanId?: string; page?: number; pageSize?: number }) => {
      const query = params
        ? '?' +
          new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
      return apiClient<ApiResponse<LedgerEntry[]>>(`/ledger${query}`);
    },
    getForLoan: async (loanId: string) => {
      return apiClient<ApiResponse<LedgerEntry[]>>(`/ledger/${loanId}`);
    },
  },

 sms: {
    getAll: async (params?: { search?: string; status?: string; page?: number; pageSize?: number }) => {
      const query = params
        ? '?' +
          new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
      return apiClient<ApiResponse<SmsLog[]>>(`/sms${query}`);
    },
    send: async (payload: { customerId?: string; phone: string; templateCode: string; variables?: Record<string, string | number> }) => {
      return apiClient<ApiResponse<null>>('/sms/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getTemplates: async () => {
      return apiClient<ApiResponse<SmsTemplateOption[]>>('/sms/templates');
    },
  },

// lib/api.ts — REPLACE only the otp/resume block at the bottom, rest of file unchanged

  otp: {
    request: async (phone: string) => {
      return apiClient<ApiResponse<{ message: string }>>('/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },
    verify: async (phone: string, code: string) => {
      return apiClient<ApiResponse<{ resumeToken: string; expiresInMinutes: number }>>('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
    },
  },

  resume: {
    get: async (token: string) => {
      return apiClient<ApiResponse<any>>(`/resume?token=${encodeURIComponent(token)}`);
    },
  },
};
