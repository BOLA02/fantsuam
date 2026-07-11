'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, FileText, User, DollarSign, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Timeline } from '@/components/timeline';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/dialog';
import { api } from '@/lib/api-routes';
import { LoanApplication, Guarantor } from '@/lib/api-types';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [guarantor, setGuarantor] = useState<Guarantor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.loanApplications.getById(appId);
      if (res.success && res.data) {
        setApplication(res.data);

        // Guarantor is a separate resource, fetched by customerId
        const gRes = await api.guarantors.getAll(res.data.customerId);
        if (gRes.success && gRes.data.length > 0) {
          setGuarantor(gRes.data[0]);
        }
      } else {
        setError(res.message || 'Application not found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load application.');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStartReview = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await api.loanApplications.changeStatus(appId, 'UNDER_REVIEW');
      await fetchApplication();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await api.loanApplications.changeStatus(appId, 'APPROVED');
      setShowApproveDialog(false);
      await fetchApplication();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionError(null);
    setActionLoading(true);
    try {
      await api.loanApplications.changeStatus(appId, 'REJECTED');
      setShowRejectDialog(false);
      await fetchApplication();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <Link href="/admin/applications" className="inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft size={18} />
          Back to Applications
        </Link>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-foreground font-semibold">{error || 'Application not found'}</p>
        </div>
      </div>
    );
  }

  const { customer, loanProduct } = application;
  const employment = customer.employments?.[0];
  const canStartReview = application.status === 'SUBMITTED';
  const canDecide = application.status === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/applications" className="inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft size={18} />
        </Link>
        <PageHeader
          title={`Application ${application.applicationNumber}`}
          description={`Submitted by ${customer.firstName} ${customer.lastName}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Application Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={application.status.toLowerCase()} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Submitted Date</span>
              <span className="font-semibold text-foreground">{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-semibold text-foreground">{new Date(application.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {(canStartReview || canDecide) && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <div className="flex flex-col gap-3">
              {canStartReview && (
                <Button
                  onClick={handleStartReview}
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin mr-2" />} Start Review
                </Button>
              )}
              {canDecide && (
                <>
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    className="bg-accent text-accent-foreground hover:opacity-90"
                  >
                    Approve Application
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    Reject Application
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <User size={20} /> Personal Information
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-semibold text-foreground mt-1">{customer.firstName} {customer.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-semibold text-foreground mt-1">{customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold text-foreground mt-1">{customer.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-semibold text-foreground mt-1">{customer.gender}</p>
          </div>
          {customer.dateOfBirth && (
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-semibold text-foreground mt-1">{new Date(customer.dateOfBirth).toLocaleDateString()}</p>
            </div>
          )}
          {employment && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Occupation</p>
                <p className="font-semibold text-foreground mt-1">{employment.occupation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employer</p>
                <p className="font-semibold text-foreground mt-1">{employment.employerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="font-semibold text-foreground mt-1">₦{(employment.monthlyIncome / 1000).toFixed(0)}K</p>
              </div>
            </>
          )}
          {customer.nin && (
            <div>
              <p className="text-sm text-muted-foreground">NIN</p>
              <p className="font-mono text-sm text-foreground mt-1">{customer.nin}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign size={20} /> Loan Details
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Loan Product</p>
            <p className="font-semibold text-foreground mt-1">{loanProduct.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Requested Amount</p>
            <p className="font-semibold text-accent text-lg mt-1">₦{(application.requestedAmount / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Repayment Duration</p>
            <p className="font-semibold text-foreground mt-1">{application.durationMonths} months</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-muted-foreground">Purpose</p>
            <p className="font-semibold text-foreground mt-1">{application.purpose}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users size={20} /> Guarantor Information
        </h3>
        {guarantor ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-semibold text-foreground mt-1">{guarantor.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground mt-1">{guarantor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-semibold text-foreground mt-1">{guarantor.relationship}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-semibold text-foreground mt-1">{guarantor.address}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No guarantor on file for this application.</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText size={20} /> Uploaded Documents
        </h3>
        {application.documents && application.documents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {application.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <FileText size={18} className="text-accent flex-shrink-0" />
                <span className="text-sm font-medium text-foreground capitalize">
                  {doc.documentType.replace('_', ' ').toLowerCase()}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        )}
      </div>

      {application.statusHistory && application.statusHistory.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Status History</h3>
          <Timeline
            items={[...application.statusHistory]
              .reverse() // statusHistory arrives newest-first; Timeline reads top-to-bottom as chronological
              .map((entry, index, arr) => ({
                id: entry.id,
                title: entry.status.replace('_', ' '),
                description: [
                  entry.remarks,
                  entry.changedBy ? `by ${entry.changedBy.firstName} ${entry.changedBy.lastName}` : null,
                ]
                  .filter(Boolean)
                  .join(' — '),
                timestamp: new Date(entry.createdAt).toLocaleString(),
                status: index === arr.length - 1 ? 'current' : 'completed',
              }))}
          />
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-500">
          {actionError}
        </div>
      )}

      <Dialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        title="Approve Application"
        description="This action will approve the loan application"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={actionLoading}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:opacity-90"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 size={16} className="animate-spin mr-2" />} Approve
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to approve this application for ₦{(application.requestedAmount / 1000).toFixed(0)}K?
          </p>
          <div className="p-4 bg-accent/10 rounded-lg">
            <p className="text-sm font-semibold text-foreground">The customer will be notified via SMS about the approval.</p>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title="Reject Application"
        description="This action will reject the loan application"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={actionLoading}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 size={16} className="animate-spin mr-2" />} Reject
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to reject this application?
          </p>
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm font-semibold text-foreground">The customer will be notified via SMS about the rejection.</p>
          </div>
        </div>
      </Dialog>
    </div>
  );
}