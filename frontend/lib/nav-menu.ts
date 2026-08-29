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
  { label: 'Applications', href: '/admin/applications', icon: FileText, permission: 'loan.applications.manage' },
  { label: 'Customers', href: '/admin/customers', icon: Users, permission: 'loan.customers.manage' },
  { label: 'Loans', href: '/admin/loans', icon: Wallet, permission: 'loan.loans.manage' },
  { label: 'Repayments', href: '/admin/repayments', icon: RotateCw, permission: 'loan.repayments.manage' },
  { label: 'Ledger', href: '/admin/ledger', icon: BookOpen, permission: 'loan.audit.view' },
  { label: 'Savings', href: '/admin/savings', icon: BookOpen, permission: 'loan.savings.manage' },
  { label: 'Loan Products', href: '/admin/products', icon: Boxes, permission: 'loan.loan-products.manage' },
  { label: 'SMS Center', href: '/admin/sms', icon: MessageSquare },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'loan.settings.manage' },
];