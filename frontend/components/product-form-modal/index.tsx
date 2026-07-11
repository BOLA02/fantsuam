'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  IdentitySection,
  FinancialsSection,
  RatesSection,
  DurationSection,
  GovernanceSection,
} from './form-sections';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingProduct: any | null;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, editingProduct }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    description: '',
    minimumAmount: 0,
    maximumAmount: 0,
    interestRate: 0,
    processingFee: 0,
    penaltyRate: 0,
    maximumDuration: 1,
    repaymentFrequency: 'MONTHLY',
    requiresGuarantor: true,
    requiresBVN: true,
    requiresNIN: false,
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      const requirementTitles = (editingProduct.requirements || [])
        .map((req: any) => req.title)
        .join(', ');

      setFormData({
        productCode: editingProduct.productCode || '',
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        minimumAmount: editingProduct.minimumAmount || 0,
        maximumAmount: editingProduct.maximumAmount || 0,
        interestRate: editingProduct.interestRate || 0,
        processingFee: editingProduct.processingFee || 0,
        penaltyRate: editingProduct.penaltyRate || 0,
        maximumDuration: editingProduct.maximumDuration || 1,
        repaymentFrequency: editingProduct.repaymentFrequency || 'MONTHLY',
        requiresGuarantor: editingProduct.requiresGuarantor ?? true,
        requiresBVN: editingProduct.requiresBVN ?? true,
        requiresNIN: editingProduct.requiresNIN ?? false,
        requirements: requirementTitles,
      });
    } else {
      setFormData({
        productCode: '',
        name: '',
        description: '',
        minimumAmount: 0,
        maximumAmount: 0,
        interestRate: 0,
        processingFee: 0,
        penaltyRate: 0,
        maximumDuration: 1,
        repaymentFrequency: 'MONTHLY',
        requiresGuarantor: true,
        requiresBVN: true,
        requiresNIN: false,
        requirements: '',
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.maximumAmount < formData.minimumAmount) {
      alert('Maximum amount cannot be less than minimum amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedRequirements = formData.requirements
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
        .map((title) => ({
          title: title,
          description: title,
          required: true,
        }));

      const payload = {
        ...formData,
        requirements: formattedRequirements,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-6 shadow-lg my-8">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          {editingProduct ? 'Edit Loan Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmitClick} className="space-y-4">
          
          <FinancialsSection formData={formData} onChange={updateFields} />
          <RatesSection formData={formData} onChange={updateFields} />
          <DurationSection formData={formData} onChange={updateFields} />
          <GovernanceSection formData={formData} onChange={updateFields} />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
