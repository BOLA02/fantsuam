'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, UserX, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api-routes';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';

interface StaffUser {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function AdminStaffManagement() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // 1. Fetch live employee listings on load
  async function loadStaffDirectory() {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.users.getAll();
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to download internal security groups directory.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStaffDirectory();
  }, []);

  // 2. Trigger your backend router.patch("/:id/status") toggle flow
  async function toggleUserStatus(id: string, currentStatus: 'ACTIVE' | 'INACTIVE') {
    try {
      setActionLoadingId(id);
      const targetNextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.users.changeStatus(id, targetNextStatus);
      
      // Update local state smoothly
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: targetNextStatus } : u));
    } catch (err: any) {
      alert(`Permission Denied: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  const columns: Column<StaffUser>[] = [
    {
      key: 'employeeNumber',
      header: 'Staff ID',
      sortable: true,
      cell: (row) => <span className="font-mono text-sm font-semibold">{row.employeeNumber}</span>,
    },
    {
      key: 'firstName',
      header: 'Full Name',
      sortable: true,
      cell: (row) => <span className="text-sm font-medium">{row.firstName} {row.lastName}</span>,
    },
    {
      key: 'email',
      header: 'Corporate Email',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Access Role',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full w-fit">
          <ShieldCheck size={12} />
          <span>{row.role}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'System Access',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
    {
      key: 'id',
      header: 'Access Control',
      cell: (row) => {
        const isUserActive = row.status === 'ACTIVE';
        return (
          <Button
            variant={isUserActive ? "destructive" : "default"}
            size="xs"
            nativeButton={false}
            disabled={actionLoadingId === row.id}
            onClick={() => toggleUserStatus(row.id, row.status)}
          >
            {actionLoadingId === row.id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isUserActive ? (
              <div className="flex items-center gap-1"><UserX size={12} /><span>Suspend</span></div>
            ) : (
              <div className="flex items-center gap-1"><UserCheck size={12} /><span>Activate</span></div>
            )}
          </Button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[20vh] flex flex-col items-center justify-center gap-2 border border-dashed rounded-lg bg-muted/20">
        <Loader2 size={24} className="animate-spin text-[#2E3192]" />
        <p className="text-xs text-muted-foreground font-medium">Downloading operational directory metadata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">User Access & Security Management</h3>
        <p className="text-sm text-muted-foreground">Manage organizational permissions, assign staff credentials, and configure active session profiles.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Notice: {error}</span>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <DataTable data={users} columns={columns} emptyMessage="No employees found in the directory layout tracker." />
      </div>
    </div>
  );
}
