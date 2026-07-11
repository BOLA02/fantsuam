// app/apply/page.tsx
// FULL FILE — UPDATED: products lifted to parent state for Step 2 + Step 5's productName

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-routes';
import { LoanProduct } from '@/lib/api-types';
import { generateCustomerNumber } from '@/lib/generate-customer-number';
import { ApplyFormData, initialFormData } from '@/components/apply/apply-types';
import { Step1PersonalInfo } from '@/components/apply/step1-personal-info';
import { Step2LoanDetails } from '@/components/apply/step2-loan-details';
import { Step3Guarantor } from '@/components/apply/step3-guarantor';
import { Step4Documents } from '@/components/apply/step4-documents';
import { Step5Review } from '@/components/apply/step5-review';
import { ApplySuccess } from '@/components/apply/apply-success';

type Step = 1 | 2 | 3 | 4 | 5;

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<ApplyFormData>(initialFormData);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [uploadedTypes, setUploadedTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.loanProducts
      .getAll()
      .then((res) => setProducts(res.data.filter((p) => p.isActive)))
      .catch((err) => setProductsError(err.message))
      .finally(() => setProductsLoading(false));
  }, []);

  const handleChange = (field: keyof ApplyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const productName = products.find((p) => p.id === formData.loanProductId)?.name || '';

  const submitStep1 = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.customers.create({
        customerNumber: generateCustomerNumber(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        email: formData.email || undefined,
        nin: formData.nin || undefined,
        bvn: formData.bvn || undefined,
        address: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode || undefined,
        },
        employment: {
          employerName: formData.employer,
          occupation: formData.occupation,
          monthlyIncome: Number(formData.monthlyIncome),
        },
      });

      setFormData((prev) => ({ ...prev, customerId: res.data.id }));
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

 const submitStep2 = async () => {
  if (!formData.customerId) {
    setError('Missing customer reference. Please restart the application.');
    return;
  }

  if (!formData.loanProductId) {
    setError('Please select a loan type.');
    return;
  }

  const amount = Number(formData.loanAmount);
  const duration = Number(formData.durationMonths);

  if (!formData.loanAmount || isNaN(amount) || amount <= 0) {
    setError('Please enter a valid loan amount.');
    return;
  }

  if (!formData.durationMonths || isNaN(duration) || duration <= 0) {
    setError('Please enter a valid repayment duration.');
    return;
  }

  if (!formData.purpose || formData.purpose.trim().length < 3) {
    setError('Please describe the purpose of the loan (at least 3 characters).');
    return;
  }

  setError(null);
  setSubmitting(true);

  try {
    const res = await api.loanApplications.create({
      customerId: formData.customerId,
      loanProductId: formData.loanProductId,
      requestedAmount: amount,
      purpose: formData.purpose,
      durationMonths: duration,
    });

    setFormData((prev) => ({
      ...prev,
      applicationId: res.data.id,
      applicationNumber: res.data.applicationNumber,
    }));
    setCurrentStep(3);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
};

  const submitStep3 = async () => {
    if (!formData.customerId) {
      setError('Missing customer reference. Please restart the application.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await api.guarantors.create({
        customerId: formData.customerId,
        fullName: formData.guarantorName,
        relationship: formData.guarantorRelationship,
        phone: formData.guarantorPhone,
        email: formData.guarantorEmail || undefined,
        occupation: formData.guarantorOccupation || undefined,
        address: formData.guarantorAddress,
      });

      setFormData((prev) => ({ ...prev, guarantorId: res.data.id }));
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
  };

  const handleFinish = () => setDone(true);

  const progressPercentage = (currentStep / 5) * 100;

  if (done && formData.applicationNumber) {
    return <ApplySuccess applicationNumber={formData.applicationNumber} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                MF
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">MicroFinance</span>
            </Link>
            <span className="text-sm text-muted-foreground">Step {currentStep} of 5</span>
          </div>
        </div>
      </nav>

      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-500">
              {error}
            </div>
          )}

          {currentStep === 1 && <Step1PersonalInfo formData={formData} onChange={handleChange} />}

          {currentStep === 2 && (
            <Step2LoanDetails
              formData={formData}
              onChange={handleChange}
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
            />
          )}

          {currentStep === 3 && <Step3Guarantor formData={formData} onChange={handleChange} />}

          {currentStep === 4 && formData.customerId && formData.applicationId && (
            <Step4Documents
              customerId={formData.customerId}
              applicationId={formData.applicationId}
              uploadedTypes={uploadedTypes}
              onUploaded={(type) => setUploadedTypes((prev) => [...prev, type])}
            />
          )}

          {currentStep === 5 && (
            <Step5Review formData={formData} productName={productName} uploadedCount={uploadedTypes.length} />
          )}

          <div className="mt-12 flex justify-between gap-4">
            <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1 || submitting} className="gap-2">
              <ArrowLeft size={16} /> Back
            </Button>

            {currentStep === 1 && (
              <Button onClick={submitStep1} disabled={submitting} className="bg-primary hover:bg-primary/90 gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />} Next →
              </Button>
            )}

            {currentStep === 2 && (
              <Button onClick={submitStep2} disabled={submitting} className="bg-primary hover:bg-primary/90 gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />} Next →
              </Button>
            )}

            {currentStep === 3 && (
              <Button onClick={submitStep3} disabled={submitting} className="bg-primary hover:bg-primary/90 gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />} Next →
              </Button>
            )}

            {currentStep === 4 && (
              <Button onClick={() => setCurrentStep(5)} className="bg-primary hover:bg-primary/90">
                Next →
              </Button>
            )}

            {currentStep === 5 && (
              <Button onClick={handleFinish} className="bg-accent hover:bg-accent/90">
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}