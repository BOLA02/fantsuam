// components/apply/step4-documents.tsx
// FULL FILE — semantic tokens restored. Same props/behavior.

'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, Loader2, FileImage } from 'lucide-react';
import { api } from '@/lib/api-routes';

const DOCUMENT_TYPES: { id: string; label: string; hint: string; required: boolean }[] = [
  { id: 'PASSPORT', label: 'Passport', hint: 'JPG, PNG or PDF', required: true },
  { id: 'NATIONAL_ID', label: 'ID Card', hint: 'JPG, PNG or PDF', required: true },
  { id: 'UTILITY_BILL', label: 'Utility Bill', hint: 'Last 3 months', required: true },
  { id: 'BANK_STATEMENT', label: 'Bank Statement', hint: 'Last 6 months', required: true },
  { id: 'EMPLOYMENT_LETTER', label: 'Employment Letter', hint: 'On letterhead', required: false },
  { id: 'BUSINESS_REGISTRATION', label: 'Business Registration', hint: 'If applicable', required: false },
];

const REQUIRED_COUNT = DOCUMENT_TYPES.filter((d) => d.required).length;

interface Props {
  customerId: string;
  applicationId: string;
  uploadedTypes: string[];
  onUploaded: (documentType: string) => void;
}

export function Step4Documents({ customerId, applicationId, uploadedTypes, onUploaded }: Props) {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredUploaded = DOCUMENT_TYPES.filter((d) => d.required && uploadedTypes.includes(d.id)).length;

  const handleFileSelect = async (documentType: string, file: File) => {
    setError(null);
    setUploadingType(documentType);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('customerId', customerId);
      formData.append('applicationId', applicationId);

      await api.documents.upload(formData);
      onUploaded(documentType);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="hidden lg:block">
        <h2 className="text-lg font-bold">Upload Documents</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Upload required supporting documents</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">
            {requiredUploaded} of {REQUIRED_COUNT} required documents uploaded
          </span>
          <span className="text-muted-foreground">{uploadedTypes.length} of {DOCUMENT_TYPES.length} total</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(requiredUploaded / REQUIRED_COUNT) * 100}%` }}
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {DOCUMENT_TYPES.map((doc) => {
          const isUploaded = uploadedTypes.includes(doc.id);
          const isUploading = uploadingType === doc.id;

          return (
            <label
              key={doc.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                isUploaded ? 'border-accent/50 bg-accent/10' : 'border-border bg-card hover:bg-muted/60'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    isUploaded ? 'bg-accent/20 text-accent-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isUploaded ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <FileImage size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-foreground">{doc.label}</p>
                    {!doc.required && (
                      <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        optional
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {isUploaded ? 'Uploaded' : isUploading ? 'Uploading…' : doc.hint}
                  </p>
                </div>
              </div>
              {!isUploaded && <Upload size={15} className="shrink-0 text-muted-foreground" />}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(doc.id, file);
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}