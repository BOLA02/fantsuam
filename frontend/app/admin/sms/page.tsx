'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Download,
  Send,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  X,
  RotateCw,
  Smartphone,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/form';
import { api } from '@/lib/api-routes';
import { SmsLog, SmsStatus } from '@/lib/api-types';
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

// Not routed through the shared Badge component — its "accent"/"secondary"
// variants render as the app's brand green regardless of what the template is
// actually about (a rejection notice showing green reads as a status error).
// This is a small, self-contained pill with explicit, purpose-matched colors.
const templateStyleMap: Record<string, string> = {
  'Application Submitted': 'bg-sky-50 text-sky-700',
  'Application Approved': 'bg-indigo-50 text-indigo-700',
  'Application Rejected': 'bg-rose-50 text-rose-700',
  'Loan Disbursement': 'bg-violet-50 text-violet-700',
  'Payment Receipt': 'bg-cyan-50 text-cyan-700',
  'Repayment Reminder': 'bg-amber-50 text-amber-700',
};

function TemplateTag({ name }: { name: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight whitespace-nowrap ${
        templateStyleMap[name] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {name}
    </span>
  );
}

export default function SMSCenterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rows, setRows] = useState<SmsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [templates, setTemplates] = useState<SmsTemplateOption[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
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
    {
      key: 'recipientName',
      header: 'Recipient',
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-foreground font-medium truncate">{row.recipientName}</p>
          <p className="text-xs text-muted-foreground truncate">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'templateName',
      header: 'Template',
      sortable: true,
      cell: (row) => <TemplateTag name={row.templateName} />,
    },
    {
      key: 'message',
      header: 'Message',
      sortable: false,
      cell: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-xs block" title={row.message}>
          {row.message}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-foreground whitespace-nowrap">
          {new Date(row.date).toLocaleString(undefined, {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
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
      setTemplatesLoading(true);
      const res = await api.sms.getTemplates();
      if (res.success && res.data) setTemplates(res.data);
    } catch (err: any) {
      setSendError(err.message || 'Failed to load templates.');
    } finally {
      setTemplatesLoading(false);
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

  const totalSent = useMemo(() => rows.filter((r) => r.status === 'SENT' || r.status === 'DELIVERED').length, [rows]);
  const totalPending = useMemo(() => rows.filter((r) => r.status === 'PENDING').length, [rows]);
  const totalFailed = useMemo(() => rows.filter((r) => r.status === 'FAILED').length, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader title="SMS Center" description="Automated and manual SMS communication log" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <MessageSquare size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total SMS</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{loading ? '—' : rows.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Sent</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{loading ? '—' : totalSent}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Clock3 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{loading ? '—' : totalPending}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{loading ? '—' : totalFailed}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by phone number or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          className="w-full shrink-0 sm:w-56"
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
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90" onClick={openSendModal}>
            <Send size={18} className="mr-2" />
            Send SMS
          </Button>
          <Button variant="outline" disabled title="Export not yet implemented">
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <RotateCw size={20} className="animate-spin" />
            <p className="text-sm">Loading SMS logs…</p>
          </div>
        ) : error ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => fetchSms(searchTerm || undefined, statusFilter || undefined)}
              className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Try again
            </button>
          </div>
        ) : (
          <DataTable data={rows} columns={columns} emptyMessage="No SMS logs found" />
        )}
      </div>

      {isSendOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={(e) => e.target === e.currentTarget && setIsSendOpen(false)}
        >
          <div className="w-full max-w-md rounded-xl bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Send size={14} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Send SMS</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSendOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-4 space-y-4">
              {sendError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{sendError}</div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">Template</label>
                <div className="mt-1">
                  {templatesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 border border-border rounded-md">
                      <RotateCw size={13} className="animate-spin" />
                      Loading templates…
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <div className="relative mt-1">
                  <Smartphone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={sendPhone}
                    onChange={(e) => setSendPhone(e.target.value)}
                    placeholder="+234..."
                    required
                  />
                </div>
              </div>

              {selectedTemplate && extractVariableNames(selectedTemplate.message).length > 0 && (
                <div className="rounded-lg border border-border p-3 space-y-3 bg-slate-50">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Fill in the details</p>
                  {extractVariableNames(selectedTemplate.message).map((varName) => (
                    <div key={varName}>
                      <label className="text-xs text-muted-foreground capitalize">{varName.replace(/_/g, ' ')}</label>
                      <Input
                        className="mt-1"
                        value={sendVariables[varName] ?? ''}
                        onChange={(e) => setSendVariables((v) => ({ ...v, [varName]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedTemplate && (
                <div className="rounded-lg border border-border bg-slate-50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Preview</p>
                  <p className="text-sm text-foreground">
                    {selectedTemplate.message.replace(/{{\s*(\w+)\s*}}/g, (_, k) => sendVariables[k] || `{{${k}}}`)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsSendOpen(false)} disabled={isSending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSending || !selectedTemplate}
                >
                  {isSending && <RotateCw size={14} className="mr-2 animate-spin" />}
                  {isSending ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}