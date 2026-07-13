'use client';

import { PackageSearch } from 'lucide-react';
import { LoanProduct } from '@/lib/api-types';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: LoanProduct[];
  onEdit: (product: LoanProduct) => void;
  onDelete: (id: string) => void;
}

export function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <PackageSearch size={22} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No loan products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first product to start offering loans.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}