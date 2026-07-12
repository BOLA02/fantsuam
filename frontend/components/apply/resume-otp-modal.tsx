// components/apply/resume-otp-modal.tsx
// NEW FILE

'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-routes';

interface Props {
  onVerified: (resumeToken: string) => void;
  onClose: () => void;
}

export function ResumeOtpModal({ onVerified, onClose }: Props) {
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async () => {
    if (!phone.trim()) {
      setError('Enter the phone number you applied with.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.otp.request(phone);
      if (res.data && (res.data as any).devCode) {
        // Only ever present when NODE_ENV !== 'production' on the backend
        console.log('[DEV ONLY] OTP code:', (res.data as any).devCode);
      }
      setStage('code');
    } catch (err: any) {
      setError(err.message || 'Could not send code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError('Enter the 6-digit code sent to your phone.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.otp.verify(phone, code);
      onVerified(res.data.resumeToken);
    } catch (err: any) {
      setError(err.message || 'Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-card border border-border p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">Verify it's you</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {stage === 'phone'
            ? "Enter the phone number you used for your application. We'll text you a code."
            : `Enter the 6-digit code sent to ${phone}.`}
        </p>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {stage === 'phone' ? (
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 801 234 5678" className="mb-4" />
        ) : (
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            className="mb-4 tracking-widest text-center"
          />
        )}

        <Button
          onClick={stage === 'phone' ? requestCode : verifyCode}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {stage === 'phone' ? 'Send code' : 'Verify & continue'}
        </Button>

        {stage === 'code' && (
          <button onClick={() => setStage('phone')} className="mt-3 text-xs text-muted-foreground hover:text-foreground w-full text-center">
            Wrong number? Go back
          </button>
        )}
      </div>
    </div>
  );
}