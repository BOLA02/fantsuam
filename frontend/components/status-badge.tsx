import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'paid' | 'overdue' | 'defaulted' | 'document_review' | 'suspended' | 'sent' | 'failed';

const statusConfig: Record<StatusType, { bg: string; text: string; label?: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  active: { bg: 'bg-blue-100', text: 'text-blue-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  paid: { bg: 'bg-green-100', text: 'text-green-800' },
  overdue: { bg: 'bg-red-100', text: 'text-red-800' },
  defaulted: { bg: 'bg-red-100', text: 'text-red-800' },
  document_review: { bg: 'bg-blue-100', text: 'text-blue-800' },
  suspended: { bg: 'bg-orange-100', text: 'text-orange-800' },
  sent: { bg: 'bg-green-100', text: 'text-green-800' },
  failed: { bg: 'bg-red-100', text: 'text-red-800' },
};

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as StatusType;
  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', config.bg, config.text, className)}>
      {status}
    </span>
  );
}
