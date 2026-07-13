'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-routes'; // Point this directly to your centralized api client instance
import { LoanProduct } from '@/lib/api-types';
import { ProductGrid } from '../../../components/product-grid';
import { ProductFormModal } from '../../../components/product-form-modal';

function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div className="w-2/3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-secondary" />
              <div className="h-3 w-1/3 rounded bg-secondary" />
            </div>
            <div className="h-5 w-14 rounded-full bg-secondary" />
          </div>
          <div className="mt-4 h-14 rounded-lg bg-secondary/60" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-8 rounded bg-secondary/60" />
            <div className="h-8 rounded bg-secondary/60" />
            <div className="h-8 rounded bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.loanProducts.getAll();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.message || 'Failed to load loan products.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormSubmit = async (payload: any) => {
    if (selectedProduct) {
      const res = await api.loanProducts.update(selectedProduct.id, payload);
      if (res.success) {
        await fetchProducts();
      } else {
        throw new Error(res.message || 'Failed to update product configuration.');
      }
    } else {
      const res = await api.loanProducts.create(payload);
      if (res.success) {
        await fetchProducts();
      } else {
        throw new Error(res.message || 'Failed to create product configuration.');
      }
    }
  };

  const handleEditInit = (product: LoanProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      try {
        const res = await api.loanProducts.delete(id);
        if (res.success) {
          await fetchProducts();
        } else {
          alert(res.message || 'Failed to delete product configuration.');
        }
      } catch (err: any) {
        alert(err.message || 'An error occurred while deleting.');
      }
    }
  };

  const activeCount = products.filter((p) => p.isActive).length;
  const avgInterest =
    products.length > 0
      ? (products.reduce((sum, p) => sum + p.interestRate, 0) / products.length).toFixed(1)
      : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Loan Products" description="Manage and configure loan products" />
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} className="mr-2" /> Add Product
        </Button>
      </div>

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatPill label="Total Products" value={products.length} />
          <StatPill label="Active" value={activeCount} />
          <StatPill label="Avg. Interest Rate" value={avgInterest === '—' ? avgInterest : `${avgInterest}%`} />
        </div>
      )}

      {loading && <ProductGridSkeleton />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle size={22} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Couldn't load loan products</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchProducts} className="mt-1">
            <RefreshCw size={14} className="mr-2" />
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && (
        <ProductGrid products={products} onEdit={handleEditInit} onDelete={handleDeleteClick} />
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingProduct={selectedProduct}
      />
    </div>
  );
}