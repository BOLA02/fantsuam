'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { api } from '@/lib/api-routes';

interface CustomerAddress {
  id: string;
  city: string;
  state: string;
}

interface CustomerEmployment {
  id: string;
  employerName: string;
  occupation: string;
  monthlyIncome: string | number;
  isCurrent: boolean;
}

interface CustomerRow {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  employments?: CustomerEmployment[];
  addresses?: CustomerAddress[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Core function to pull and hydrate rows from the backend
  async function loadCustomersData(query?: string) {
    try {
      setIsLoading(true);
      setError('');
      
      const res = query 
        ? await api.customers.search(query)
        : await api.customers.getAll();
        
      setCustomers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with customer directory modules.');
    } finally {
      setIsLoading(false);
    }
  }

  // Load everything on initial render
  useEffect(() => {
    loadCustomersData();
  }, []);

  // 2. Continuous real-time live search query fetcher hook
  useEffect(() => {
    if (!searchTerm) {
      loadCustomersData();
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      loadCustomersData(searchTerm);
    }, 400); // 400ms debounce buffer to prevent overwhelming the Express server

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const columns: Column<CustomerRow>[] = [
    {
      key: 'customerNumber',
      header: 'Customer ID',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.customerNumber}</span>,
    },
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      cell: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: 'phone',
      header: 'Phone Reference',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      cell: (row) => row.email || <span className="text-muted-foreground italic text-xs">None Provided</span>,
    },
    {
      key: 'id',
      header: 'Monthly Income',
      cell: (row) => {
        // Find their current active job record inside the nested relation array
        const currentJob = row.employments?.find(e => e.isCurrent) || row.employments?.[0];
        const income = currentJob ? Number(currentJob.monthlyIncome) : 0;
        
        return (
          <span className="font-semibold text-foreground">
            {income > 0 ? `₦${(income / 1000).toFixed(0)}K` : '₦0'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Member Since',
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          {/* Base UI standard implementation parameter passing */}
          <Button variant="outline" size="sm" className="w-8 h-8 p-0" render={<Link href={`/admin/customers/${row.id}`} />} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers Profile Directory"
        description="View demographic parameters, contact metrics, and linked sub-relational records."
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Live search by name, phone, or email index parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button nativeButton={true} className="bg-primary hover:bg-primary/90">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Notice: {error}</span>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#2E3192]" />
            <p className="text-xs text-muted-foreground">Pulling profiles from the relational engine...</p>
          </div>
        ) : (
          <DataTable
            data={customers}
            columns={columns}
            emptyMessage="No matching customer indices found in database partitions."
          />
        )}
      </div>
    </div>
  );
}
