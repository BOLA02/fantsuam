'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/dialog';

export default function UpdateDocumentsPage() {
  const [step, setStep] = useState<'lookup' | 'upload' | 'success'>('lookup');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [validated, setValidated] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const requiredDocuments = ['Passport', 'ID Card', 'Utility Bill', 'Bank Statement'];

  const handleValidate = () => {
    if (applicationNumber && phone) {
      setValidated(true);
    }
  };

  const handleDocumentSelect = (doc: string) => {
    if (!selectedDocuments.includes(doc)) {
      setSelectedDocuments([...selectedDocuments, doc]);
    }
  };

  const handleDocumentRemove = (doc: string) => {
    setSelectedDocuments(selectedDocuments.filter(d => d !== doc));
  };

  const handleSubmit = () => {
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                MF
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">MicroFinance</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/">Back</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Lookup Step */}
          {step === 'lookup' && (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-foreground">Update Your Documents</h1>
                <p className="mt-4 text-muted-foreground">
                  Enter your application details to update or submit additional documents
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground">Application Number</label>
                  <Input
                    placeholder="MF-2026-000123"
                    value={applicationNumber}
                    onChange={(e) => setApplicationNumber(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    placeholder="+234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleValidate}
                  disabled={!applicationNumber || !phone}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Validate & Continue
                </Button>
              </div>
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && validated && (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-foreground">Upload Required Documents</h1>
                <p className="mt-4 text-muted-foreground">
                  Application: <span className="font-mono font-semibold text-foreground">{applicationNumber}</span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Please upload the following documents:</p>
                  <p className="text-sm text-blue-800">These documents are required to complete your loan application</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {requiredDocuments.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <div className="flex items-center gap-3">
                      <Upload size={20} className="text-muted-foreground" />
                      <p className="font-medium text-foreground">{doc}</p>
                    </div>
                    {selectedDocuments.includes(doc) && (
                      <CheckCircle size={20} className="text-accent" />
                    )}
                  </div>
                ))}
              </div>

              {selectedDocuments.length > 0 && (
                <div className="bg-accent/10 p-4 rounded-lg mb-8">
                  <p className="text-sm font-medium text-foreground mb-3">Selected Documents ({selectedDocuments.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocuments.map(doc => (
                      <button
                        key={doc}
                        onClick={() => handleDocumentRemove(doc)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium hover:opacity-80"
                      >
                        {doc}
                        <span>×</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => { setStep('lookup'); setValidated(false); }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedDocuments.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Submit Documents
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle size={48} className="text-accent" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Documents Submitted Successfully!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your documents have been received and are under review. We will contact you if we need any additional information.
              </p>
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Application Number</p>
                <p className="text-2xl font-semibold text-foreground font-mono">
                  {applicationNumber}
                </p>
              </div>
              <p className="text-muted-foreground mb-8">
                You will receive an SMS confirmation shortly.
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/">Back Home</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
