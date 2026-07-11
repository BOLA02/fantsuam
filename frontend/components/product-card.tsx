'use client';

import { Edit, Trash2 } from 'lucide-react';

interface Requirement {
  id?: string;
  title: string;
  required?: boolean;
}

interface LoanProduct {
  id: string;
  productCode: string;
  name: string;
  description?: string;
  minimumAmount: number;
  maximumAmount: number;
  interestRate: number;
  penaltyRate: number;
  maximumDuration: number;
  repaymentFrequency: string;
  requirements?: Requirement[];
}

interface ProductCardProps {
  product: LoanProduct;
  onEdit: (product: LoanProduct) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground mr-2">
            {product.productCode}
          </span>
          <h3 className="text-lg font-semibold text-foreground inline-block mt-1">{product.name}</h3>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <Edit size={16} />
          </button>
          <button 
            type="button"
            onClick={() => onDelete(product.id)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{product.description || 'No description provided'}</p>

      <div className="space-y-3 mb-6 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount Range</span>
          <span className="font-semibold text-foreground">
            ₦{((product.minimumAmount || 0) / 1000).toFixed(0)}K - ₦{((product.maximumAmount || 0) / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Interest / Penalty</span>
          <span className="font-semibold text-accent">{product.interestRate}% / {product.penaltyRate}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Max Duration</span>
          <span className="font-semibold text-foreground">
            {product.maximumDuration} months ({product.repaymentFrequency?.toLowerCase()})
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Requirements</p>
        <ul className="space-y-1">
          {(product.requirements || []).slice(0, 3).map((req, idx) => (
            <li key={req.id || idx} className="text-xs text-muted-foreground">
              • {req.title} {req.required ? '(Required)' : ''}
            </li>
          ))}
          {product.requirements && product.requirements.length > 3 && (
            <li className="text-xs text-accent">+{product.requirements.length - 3} more</li>
          )}
        </ul>
      </div>
    </div>
  );
}
