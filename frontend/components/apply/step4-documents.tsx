// components/apply/step4-documents.tsx

'use client';

import { useState } from 'react';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-routes';

const DOCUMENT_TYPES: { id: string; label: string }[] = [
  { id: 'PASSPORT', label: 'Passport' },
  { id: 'NATIONAL_ID', label: 'ID Card' },
  { id: 'UTILITY_BILL', label: 'Utility Bill' },
  { id: 'BANK_STATEMENT', label: 'Bank Statement' },
  { id: 'EMPLOYMENT_LETTER', label: 'Employment Letter' },
  { id: 'BUSINESS_REGISTRATION', label: 'Business Registration' },
];

interface Props {
  customerId: string;
  applicationId: string;
  uploadedTypes: string[];
  onUploaded: (documentType: string) => void;
}

export function Step4Documents({ customerId, applicationId, uploadedTypes, onUploaded }: Props) {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Documents</h2>
        <p className="mt-2 text-muted-foreground">Upload required supporting documents</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-3">
        {DOCUMENT_TYPES.map((doc) => {
          const isUploaded = uploadedTypes.includes(doc.id);
          const isUploading = uploadingType === doc.id;

          return (
            <label
              key={doc.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isUploading ? (
                  <Loader2 size={20} className="text-muted-foreground animate-spin" />
                ) : (
                  <Upload size={20} className="text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">{doc.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {isUploaded ? 'Uploaded' : 'Click to upload'}
                  </p>
                </div>
              </div>
              {isUploaded && <CheckCircle size={20} className="text-accent" />}
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