'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Send } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/form';
import { api } from '@/lib/api-routes';
import { SmsLog, SmsStatus } from '@/lib/api-types';
import { X } from 'lucide-react';
import { SmsTemplateOption } from '@/lib/api-types';

interface SmsRow {
  id: string;
  recipientName: string;
  phone: string;
  message: string;
  templateName: string;
  status: SmsStatus;
  date: string;
}

function toRow(log: SmsLog): SmsRow {
  return {
    id: log.id,
    recipientName: log.customer ? `${log.customer.firstName} ${log.customer.lastName}` : '—',
    phone: log.phone,
    message: log.message,
    templateName: log.template?.name ?? '—',
    status: log.smsStatus,
    date: log.sentAt ?? log.createdAt,
  };
}

const templateColorMap: Record<string, 'default' | 'primary' | 'accent' | 'secondary' | 'destructive'> = {
  'Application Submitted': 'primary',
  'Application Approved': 'accent',
  'Application Rejected': 'destructive',
  'Loan Disbursement': 'primary',
  'Payment Receipt': 'accent',
  'Repayment Reminder': 'secondary',
};

export default function SMSCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rows, setRows] = useState<SmsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSendOpen, setIsSendOpen] = useState(false);
const [templates, setTemplates] = useState<SmsTemplateOption[]>([]);
const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplateOption | null>(null);
const [sendPhone, setSendPhone] = useState('');
const [sendVariables, setSendVariables] = useState<Record<string, string>>({});
const [sendError, setSendError] = useState('');
const [isSending, setIsSending] = useState(false);

  const fetchSms = useCallback(async (search?: string, status?: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.sms.getAll({ search: search || undefined, status: status || undefined });
      if (res.success && res.data) {
        setRows(res.data.map(toRow));
      } else {
        setError(res.message || 'Failed to load SMS logs.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSms();
  }, [fetchSms]);

  useEffect(() => {
    const t = setTimeout(() => fetchSms(searchTerm || undefined, statusFilter || undefined), 350);
    return () => clearTimeout(t);
  }, [searchTerm, statusFilter, fetchSms]);

  const columns: Column<SmsRow>[] = [
    { key: 'recipientName', header: 'Recipient', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    {
      key: 'templateName',
      header: 'Template',
      sortable: true,
      cell: (row) => (
        <Badge variant={templateColorMap[row.templateName] || 'default'} size="sm">
          {row.templateName}
        </Badge>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      sortable: false,
      cell: (row) => <span className="text-sm text-muted-foreground truncate max-w-xs">{row.message}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.date).toLocaleString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
  ];


  async function openSendModal() {
  setSendError('');
  setSendPhone('');
  setSelectedTemplate(null);
  setSendVariables({});
  setIsSendOpen(true);
  try {
    const res = await api.sms.getTemplates();
    if (res.success && res.data) setTemplates(res.data);
  } catch (err: any) {
    setSendError(err.message || 'Failed to load templates.');
  }
}

function extractVariableNames(message: string): string[] {
  const matches = message.matchAll(/{{\s*(\w+)\s*}}/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

async function handleSend(e: React.FormEvent) {
  e.preventDefault();
  if (!selectedTemplate || !sendPhone) {
    setSendError('Select a template and enter a phone number.');
    return;
  }
  try {
    setIsSending(true);
    setSendError('');
    await api.sms.send({
      phone: sendPhone,
      templateCode: selectedTemplate.code,
      variables: sendVariables,
    });
    setIsSendOpen(false);
    await fetchSms(searchTerm || undefined, statusFilter || undefined);
  } catch (err: any) {
    setSendError(err.message || 'Failed to send SMS.');
  } finally {
    setIsSending(false);
  }
}

  const totalSent = rows.filter((r) => r.status === 'SENT' || r.status === 'DELIVERED').length;
  const totalPending = rows.filter((r) => r.status === 'PENDING').length;
  const totalFailed = rows.filter((r) => r.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      <PageHeader title="SMS Center" description="Automated and manual SMS communication log" />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total SMS</p>
          <p className="text-2xl font-bold text-foreground mt-2">{rows.length}</p>
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
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'SENT', label: 'Sent' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'FAILED', label: 'Failed' },
          ]}
        />
<Button className="bg-primary hover:bg-primary/90" onClick={openSendModal}>
  <Send size={18} className="mr-2" />
  Send SMS
</Button>
        <Button variant="outline" disabled title="Export not yet implemented">
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading SMS logs...</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : (
          <DataTable data={rows} columns={columns} emptyMessage="No SMS logs found" />
        )}
      </div>

      {isSendOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Send SMS</h3>
        <button type="button" onClick={() => setIsSendOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSend} className="p-4 space-y-4">
        {sendError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{sendError}</div>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Template</label>
          <Select
            value={selectedTemplate?.code ?? ''}
            onChange={(e) => {
              const t = templates.find((t) => t.code === e.target.value) ?? null;
              setSelectedTemplate(t);
              setSendVariables({});
            }}
            options={[
              { value: '', label: 'Select a template...' },
              ...templates.map((t) => ({ value: t.code, label: t.name })),
            ]}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Phone Number</label>
          <Input value={sendPhone} onChange={(e) => setSendPhone(e.target.value)} placeholder="+234..." required />
        </div>
        {selectedTemplate &&
          extractVariableNames(selectedTemplate.message).map((varName) => (
            <div key={varName}>
              <label className="text-xs text-muted-foreground">{varName}</label>
              <Input
                value={sendVariables[varName] ?? ''}
                onChange={(e) => setSendVariables((v) => ({ ...v, [varName]: e.target.value }))}
              />
            </div>
          ))}
        {selectedTemplate && (
          <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
            Preview: {selectedTemplate.message.replace(/{{\s*(\w+)\s*}}/g, (_, k) => sendVariables[k] || `{{${k}}}`)}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setIsSendOpen(false)} disabled={isSending}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSending || !selectedTemplate}>
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}