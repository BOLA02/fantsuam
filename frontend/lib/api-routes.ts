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
  Loan
} from './api-types';

export const api = {
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
  },
};