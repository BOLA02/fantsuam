'use client';

import { ProductCard } from './product-card';

interface ProductGridProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-card text-muted-foreground">
        No active configurations discovered. Click "Add Product" to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
