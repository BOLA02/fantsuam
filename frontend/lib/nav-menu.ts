import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  RotateCw,
  BookOpen,
  Boxes,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react';

export const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Loans', href: '/admin/loans', icon: Wallet },
  { label: 'Repayments', href: '/admin/repayments', icon: RotateCw },
  { label: 'Ledger', href: '/admin/ledger', icon: BookOpen },
  { label: 'Loan Products', href: '/admin/products', icon: Boxes },
  { label: 'SMS Center', href: '/admin/sms', icon: MessageSquare },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];
