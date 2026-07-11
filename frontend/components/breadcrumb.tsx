import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={16} className="text-muted-foreground" />}
          {item.href ? (
            <Link href={item.href} className="text-sm text-accent hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-sm text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
