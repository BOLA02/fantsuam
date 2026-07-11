'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-routes'; // Point this directly to your centralized api client instance
import { ProductGrid } from '../../../components/product-grid';
import { ProductFormModal } from '../../../components/product-form-modal';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.loanProducts.getAll();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.message || 'Failed to populate loan items.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected runtime connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedProduct) {
        const res = await api.loanProducts.update(selectedProduct.id, payload);
        if (res.success) {
          await fetchProducts();
        } else {
          alert(res.message || 'Failed to update product configuration.');
        }
      } else {
        const res = await api.loanProducts.create(payload);
        if (res.success) {
          await fetchProducts();
        } else {
          alert(res.message || 'Failed to create product configuration.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during submission.');
    }
  };

  const handleEditInit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this configuration completely?')) {
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

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading products module configuration...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

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

      <ProductGrid 
        products={products}
        onEdit={handleEditInit}
        onDelete={handleDeleteClick}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingProduct={selectedProduct}
      />
    </div>
  );
}
