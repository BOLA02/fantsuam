'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { AuthInput, AuthShell, PrimaryAuthButton } from '@/components/auth/auth-shell';
import { api } from '@/lib/api-routes';

export default function AdminLoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [showPassword, setShowPassword] = useState(false); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState('');
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); if (!email || !password) { setError('Enter your email and password to continue.'); return; }
    setIsLoading(true); try { const response = await api.auth.login({ email, password }); if (!response.success || !response.data?.token) throw new Error("That email and password don't match."); const token = response.data.token; localStorage.setItem('token', token); document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict; Secure`; router.push('/admin'); } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Try again.'); } finally { setIsLoading(false); }
  }
  return <AuthShell admin eyebrow="Staff workspace" title="Welcome back." description="Sign in to manage members, track loan cycles, and keep community records in order."><form onSubmit={handleSubmit} className="space-y-5" noValidate><AuthInput label="Work email" required type="email" autoComplete="email" placeholder="you@fantsuam.org" value={email} onChange={(e) => setEmail(e.target.value)} /><div className="relative"><AuthInput label="Password" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-[39px] rounded-lg p-1.5 text-[#7A7669] hover:bg-[#F2EFE7] hover:text-[#2E3192]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><div className="flex justify-end"><a href="/admin/forgot-password" className="text-sm font-semibold text-[#1E7A34] hover:underline">Forgot password?</a></div>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<PrimaryAuthButton disabled={isLoading}>{isLoading ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : <><LockKeyhole size={17} /> Access staff workspace</>}</PrimaryAuthButton></form><p className="mt-7 text-center text-xs leading-5 text-[#8C8577]">Internal access only. Having trouble signing in? Contact your system administrator.</p></AuthShell>;
}
