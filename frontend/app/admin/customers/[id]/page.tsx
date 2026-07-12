'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-routes';
import { Customer } from '@/lib/api-types';

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadCustomer(customerId: string) {
      try {
        setIsLoading(true);
        setError('');
        const res = await api.customers.getById(customerId);
        if (!cancelled) {
          setCustomer(res.data ?? null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load customer record.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCustomer(id);

    return () => {
      cancelled = true;
    };
  }, [id]);

  const sectionClassName = 'rounded-lg border border-border bg-card p-6';
  const sectionTitleClassName = 'text-sm font-semibold text-foreground mb-4';
  const fieldLabelClassName = 'text-xs text-muted-foreground';
  const fieldValueClassName = 'text-sm text-foreground font-medium';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Link>
        <PageHeader
          title={
            customer
              ? `${customer.firstName} ${customer.lastName}`
              : 'Customer Profile'
          }
          description={
            customer
              ? `Customer ID: ${customer.customerNumber}`
              : 'View customer demographic and contact information.'
          }
        />
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Notice: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className={sectionClassName}>
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#2E3192]" />
            <p className="text-xs text-muted-foreground">Loading customer record...</p>
          </div>
        </div>
      ) : !customer ? (
        !error && (
          <div className={sectionClassName}>
            <p className="text-sm text-muted-foreground">Customer not found.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className={`${sectionClassName} lg:col-span-2`}>
            <h3 className={sectionTitleClassName}>Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={fieldLabelClassName}>Full Name</p>
                <p className={fieldValueClassName}>
                  {customer.firstName} {customer.middleName ? `${customer.middleName} ` : ''}{customer.lastName}
                </p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Customer Number</p>
                <p className={`${fieldValueClassName} font-mono`}>{customer.customerNumber}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Phone</p>
                <p className={fieldValueClassName}>{customer.phone}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Email</p>
                <p className={fieldValueClassName}>
                  {customer.email || <span className="text-muted-foreground italic font-normal">None provided</span>}
                </p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Gender</p>
                <p className={fieldValueClassName}>{customer.gender}</p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Date of Birth</p>
                <p className={fieldValueClassName}>
                  {customer.dateOfBirth
                    ? new Date(customer.dateOfBirth).toLocaleDateString()
                    : <span className="text-muted-foreground italic font-normal">Not provided</span>}
                </p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Status</p>
                <p className={fieldValueClassName}>
                  <span
                    className={
                      customer.status === 'ACTIVE'
                        ? 'inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200'
                        : 'inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border'
                    }
                  >
                    {customer.status}
                  </span>
                </p>
              </div>
              <div>
                <p className={fieldLabelClassName}>Branch</p>
                <p className={fieldValueClassName}>
                  {customer.branch?.name || <span className="text-muted-foreground italic font-normal">Unassigned</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Identity Verification</h3>
            <div className="space-y-3">
              <div>
                <p className={fieldLabelClassName}>BVN</p>
                <p className={`${fieldValueClassName} font-mono`}>
                  {customer.bvn || <span className="text-muted-foreground italic font-normal font-sans">Not provided</span>}
                </p>
              </div>
              <div>
                <p className={fieldLabelClassName}>NIN</p>
                <p className={`${fieldValueClassName} font-mono`}>
                  {customer.nin || <span className="text-muted-foreground italic font-normal font-sans">Not provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className={`${sectionClassName} lg:col-span-2`}>
            <h3 className={sectionTitleClassName}>Addresses</h3>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((address, i) => (
                  <div key={i} className="text-sm text-foreground border-b border-border last:border-0 pb-3 last:pb-0">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p className="text-muted-foreground">
                      {address.city}, {address.state}, {address.country}
                      {address.postalCode ? ` ${address.postalCode}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No addresses on file.</p>
            )}
          </div>

          {/* Employment */}
          <div className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Employment</h3>
            {customer.employments && customer.employments.length > 0 ? (
              <div className="space-y-3">
                {customer.employments.map((employment, i) => (
                  <div key={i} className="text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-foreground">{employment.employerName}</p>
                    <p className="text-muted-foreground">{employment.occupation}</p>
                    <p className="text-foreground font-semibold mt-1">
                      ₦{employment.monthlyIncome.toLocaleString()}/mo
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No employment records on file.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}