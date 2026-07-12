// app/apply/page.tsx
// FULL FILE — sidebar removed (horizontal top stepper), semantic tokens restored
// everywhere. Mobile-responsive pass added. All handlers/logic unchanged.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
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
import { ResumeBanner } from '@/components/apply/resume-banner';
import { ResumeOtpModal } from '@/components/apply/resume-otp-modal';
import { getApplyProgress, saveApplyProgress, clearApplyProgress } from '@/lib/apply-storage';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: 1, label: 'Personal Info', description: 'About you' },
  { id: 2, label: 'Loan Details', description: 'What you need' },
  { id: 3, label: 'Guarantor', description: 'Your reference' },
  { id: 4, label: 'Documents', description: 'Verification' },
  { id: 5, label: 'Review', description: 'Confirm & submit' },
];

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

  // Resume flow state
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [resumeFirstName, setResumeFirstName] = useState<string | undefined>();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    api.loanProducts
      .getAll()
      .then((res) => setProducts(res.data.filter((p) => p.isActive)))
      .catch((err) => setProductsError(err.message))
      .finally(() => setProductsLoading(false));
  }, []);

  // Detect saved progress on mount — this is a HINT only, never trusted as auth.
  // The actual data is only fetched after OTP verification below.
  useEffect(() => {
    const saved = getApplyProgress();
    if (saved?.customerId && !formData.customerId) {
      setResumeFirstName(saved.firstName);
      setShowResumeBanner(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: keyof ApplyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const productName = products.find((p) => p.id === formData.loanProductId)?.name || '';

  // --- Resume flow handlers ---

  const handleResumeContinue = () => {
    setShowResumeBanner(false);
    setShowOtpModal(true);
  };

  const handleResumeDismiss = () => {
    clearApplyProgress();
    setShowResumeBanner(false);
  };

  const handleOtpVerified = async (resumeToken: string) => {
    setResuming(true);
    setError(null);
    try {
      const res = await api.resume.get(resumeToken);
      const state = res.data;
      const c = state.customer;
      const app = state.application;
      const guarantor = state.guarantors?.[0];

      // customerRepository.findById() returns addresses/employments as ARRAYS
      // (isPrimary / isCurrent flags), not singular objects — pick the right one.
      const primaryAddress =
        c.addresses?.find((a: any) => a.isPrimary) ?? c.addresses?.[0];
      const currentEmployment =
        c.employments?.find((e: any) => e.isCurrent) ?? c.employments?.[0];

      setFormData((prev) => ({
        ...prev,
        customerId: c.id,
        firstName: c.firstName ?? '',
        lastName: c.lastName ?? '',
        middleName: c.middleName ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        gender: c.gender ?? '',
        dateOfBirth: c.dateOfBirth ? String(c.dateOfBirth).slice(0, 10) : '',
        nin: c.nin ?? '',
        bvn: c.bvn ?? '',
        addressLine1: primaryAddress?.addressLine1 ?? '',
        addressLine2: primaryAddress?.addressLine2 ?? '',
        city: primaryAddress?.city ?? '',
        state: primaryAddress?.state ?? '',
        country: primaryAddress?.country ?? '',
        postalCode: primaryAddress?.postalCode ?? '',
        occupation: currentEmployment?.occupation ?? '',
        employer: currentEmployment?.employerName ?? '',
        monthlyIncome:
          currentEmployment?.monthlyIncome != null ? String(currentEmployment.monthlyIncome) : '',
        applicationId: app?.id ?? '',
        applicationNumber: app?.applicationNumber ?? '',
        loanProductId: app?.loanProductId ?? '',
        loanAmount: app?.requestedAmount != null ? String(app.requestedAmount) : '',
        purpose: app?.purpose ?? '',
        durationMonths: app?.durationMonths != null ? String(app.durationMonths) : '',
        guarantorId: guarantor?.id ?? '',
        guarantorName: guarantor?.fullName ?? '',
        guarantorPhone: guarantor?.phone ?? '',
        guarantorRelationship: guarantor?.relationship ?? '',
        guarantorEmail: guarantor?.email ?? '',
        guarantorOccupation: guarantor?.occupation ?? '',
        guarantorAddress: guarantor?.address ?? '',
      }));

      if (state.documents?.length) {
        setUploadedTypes(state.documents.map((d: any) => d.documentType));
      }

      saveApplyProgress({
        customerId: c.id,
        applicationId: app?.id,
        guarantorId: guarantor?.id,
        firstName: c.firstName,
      });

      setCurrentStep(state.resumeStep as Step);
      setShowOtpModal(false);
    } catch (err: any) {
      setError(err.message || 'Could not resume your application.');
      setShowOtpModal(false);
    } finally {
      setResuming(false);
    }
  };

  // --- Step submit handlers ---

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
      saveApplyProgress({ customerId: res.data.id, firstName: formData.firstName });
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
      saveApplyProgress({ customerId: formData.customerId, applicationId: res.data.id });
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
      saveApplyProgress({
        customerId: formData.customerId,
        applicationId: formData.applicationId,
        guarantorId: res.data.id,
      });
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

  const handleFinish = () => {
    clearApplyProgress();
    setDone(true);
  };

  // Only allow jumping back to a step that's already been completed/visited.
  const handleEditStep = (step: 1 | 2 | 3 | 4) => {
    if (step < currentStep) setCurrentStep(step);
  };

  if (done && formData.applicationNumber) {
    return <ApplySuccess applicationNumber={formData.applicationNumber} />;
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      {showOtpModal && (
        <ResumeOtpModal onVerified={handleOtpVerified} onClose={() => setShowOtpModal(false)} />
      )}

      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8 lg:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
            <Image src="/logo.png" alt="MicroFinance logo" fill className="object-contain" priority />
          </div>
          <span className="truncate text-sm font-semibold text-foreground">MicroFinance</span>
        </Link>
        <div className="hidden min-w-0 text-center sm:block">
          <h1 className="truncate text-base font-semibold">{STEPS[currentStep - 1].label}</h1>
          <p className="truncate text-xs text-muted-foreground">{STEPS[currentStep - 1].description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:px-3 sm:text-xs">
          Step {currentStep} of {STEPS.length}
        </span>
      </header>

      {/* Mobile-only title (shown when header title is hidden below sm) */}
      <div className="shrink-0 border-b border-border bg-card px-3 pt-2 text-center sm:hidden">
        <h1 className="text-sm font-semibold">{STEPS[currentStep - 1].label}</h1>
        <p className="text-[11px] text-muted-foreground">{STEPS[currentStep - 1].description}</p>
      </div>

      {/* Horizontal stepper — replaces sidebar */}
      <div className="shrink-0 overflow-x-auto border-b border-border bg-card px-3 py-3 sm:px-4 sm:py-4 lg:px-10">
        <div className="mx-auto flex max-w-3xl min-w-[320px] items-center">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;
            return (
              <div key={step.id} className={`flex items-center ${idx < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold sm:h-7 sm:w-7 sm:text-xs ${
                      isComplete
                        ? 'bg-secondary text-secondary-foreground'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground ring-1 ring-border'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 size={13} /> : step.id}
                  </div>
                  <p
                    className={`hidden text-center text-[10px] font-medium leading-tight sm:block sm:text-[11px] ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`mx-1.5 h-px flex-1 sm:mx-2 ${isComplete ? 'bg-secondary' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-10 lg:py-8">
        <div className="mx-auto flex h-full max-w-3xl flex-col">
          {showResumeBanner && (
            <ResumeBanner
              firstName={resumeFirstName}
              onContinue={handleResumeContinue}
              onDismiss={handleResumeDismiss}
            />
          )}

          {resuming && (
            <div className="mb-4 flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Loading your application…
            </div>
          )}

          {error && (
            <div className="mb-4 shrink-0 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-7">
            {currentStep === 1 && (
              <>
                <Step1PersonalInfo formData={formData} onChange={handleChange} />
                <button
                  onClick={() => setShowOtpModal(true)}
                  className="mt-4 self-start text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Already started an application?
                </button>
              </>
            )}

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
              <Step5Review
                formData={formData}
                productName={productName}
                uploadedCount={uploadedTypes.length}
                onEditStep={handleEditStep}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 lg:px-10 lg:py-4">
        <div className="mx-auto flex max-w-3xl justify-between gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 1 || submitting}
            className="gap-1.5 px-3 sm:gap-2 sm:px-4"
          >
            <ArrowLeft size={15} /> <span className="hidden xs:inline sm:inline">Back</span>
          </Button>

          {currentStep === 1 && (
            <Button size="sm" onClick={submitStep1} disabled={submitting} className="gap-1.5 px-3 sm:gap-2 sm:px-4">
              {submitting && <Loader2 size={15} className="animate-spin" />} Next <ArrowRight size={15} />
            </Button>
          )}
          {currentStep === 2 && (
            <Button size="sm" onClick={submitStep2} disabled={submitting} className="gap-1.5 px-3 sm:gap-2 sm:px-4">
              {submitting && <Loader2 size={15} className="animate-spin" />} Next <ArrowRight size={15} />
            </Button>
          )}
          {currentStep === 3 && (
            <Button size="sm" onClick={submitStep3} disabled={submitting} className="gap-1.5 px-3 sm:gap-2 sm:px-4">
              {submitting && <Loader2 size={15} className="animate-spin" />} Next <ArrowRight size={15} />
            </Button>
          )}
          {currentStep === 4 && (
            <Button size="sm" onClick={() => setCurrentStep(5)} className="gap-1.5 px-3 sm:gap-2 sm:px-4">
              Next <ArrowRight size={15} />
            </Button>
          )}
          {currentStep === 5 && (
            <Button
              size="sm"
              onClick={handleFinish}
              className="gap-1.5 bg-secondary px-3 text-secondary-foreground hover:bg-secondary/90 sm:gap-2 sm:px-4"
            >
              <CheckCircle2 size={15} /> Finish
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}