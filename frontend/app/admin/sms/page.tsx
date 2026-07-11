'use client';

import { useState } from 'react';
import { MessageSquare, Download, Send } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form';
import { mockData } from '@/lib/mock-data';

interface SMSRow {
  id: string;
  recipient: string;
  message: string;
  template: string;
  status: string;
  deliveryDate: string;
}

export default function SMSCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const smsLogs: SMSRow[] = mockData.sms
    .filter(sms =>
      sms.recipient.includes(searchTerm) ||
      sms.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime());

  const columns: Column<SMSRow>[] = [
    {
      key: 'recipient',
      header: 'Recipient',
      sortable: true,
    },
    {
      key: 'template',
      header: 'Template',
      sortable: true,
      cell: (row) => {
        const colorMap: Record<string, 'default' | 'primary' | 'accent' | 'secondary' | 'destructive'> = {
          'Application Submitted': 'primary',
          'Approval': 'accent',
          'Rejection': 'destructive',
          'Reminder': 'secondary',
          'Penalty': 'destructive',
          'Payment Receipt': 'accent',
        };
        return (
          <Badge variant={colorMap[row.template] || 'default'} size="sm">
            {row.template}
          </Badge>
        );
      },
    },
    {
      key: 'message',
      header: 'Message',
      sortable: false,
      cell: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-xs">{row.message}</span>
      ),
    },
    {
      key: 'deliveryDate',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.deliveryDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
  ];

  const totalSent = smsLogs.filter(s => s.status === 'Sent').length;
  const totalPending = smsLogs.filter(s => s.status === 'Pending').length;
  const totalFailed = smsLogs.filter(s => s.status === 'Failed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Center"
        description="Manage SMS communications and templates"
      />

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total SMS</p>
          <p className="text-2xl font-bold text-foreground mt-2">{smsLogs.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Sent</p>
          <p className="text-2xl font-bold text-accent mt-2">{totalSent}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{totalPending}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Failed</p>
          <p className="text-2xl font-bold text-destructive mt-2">{totalFailed}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by phone number or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Send size={18} className="mr-2" />
          Send SMS
        </Button>
        <Button variant="outline">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <DataTable
          data={smsLogs}
          columns={columns}
          emptyMessage="No SMS logs found"
        />
      </div>
    </div>
  );
}
