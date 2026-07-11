'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
// 👇 IMPORT YOUR CENTRAL API WRAPPER
import { api } from '@/lib/api-routes';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // 👇 USE THE IMPLEMENTED GLOBAL CLIENT INSTANCE 
      const response = await api.auth.login({ email, password });

      if (response.success && response.data?.token) {
        const token = response.data.token;

        // 1. Save token for client component interceptors
        localStorage.setItem('token', token);

        // 2. Set an explicit cookie so your Server Components can bypass auth guards
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;

        // 3. Clear data and push to the admin layout gateway
        router.push('/admin');
      } else {
        throw new Error('That email and password don\'t match.');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#FAF6EC]">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between overflow-hidden bg-[#FAF6EC] border-r border-[#E4DCC8] px-12 py-14">
        {/* Repeating wave motif, echoing the line under the logo */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full opacity-[0.14]"
          height="420"
          viewBox="0 0 600 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <path
              key={row}
              d={`M -20 ${60 + row * 68} C 60 ${20 + row * 68}, 140 ${100 + row * 68}, 220 ${60 + row * 68} C 300 ${20 + row * 68}, 380 ${100 + row * 68}, 460 ${60 + row * 68} C 540 ${20 + row * 68}, 600 ${60 + row * 68}, 640 ${60 + row * 68}`}
              fill="none"
              stroke="#1E7A34"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="Fantsuam Foundation"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
        </div>

        <div className="relative z-10 space-y-4 max-w-sm">
          <h1 className="font-serif text-[2rem] leading-tight text-[#2E3192]">
            Fantsuam Foundation
            <span className="block text-[#1E7A34]">Admin Portal</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-[#514E45]">
            Sign in to manage members, track loan cycles, and keep the community's records in order.
          </p>
        </div>

        <p className="relative z-10 text-xs text-[#8C8577]">
          © {new Date().getFullYear()} Fantsuam Foundation. Internal use only.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/logo.png"
              alt="Fantsuam Foundation"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
            <span className="font-serif text-lg text-[#2E3192]">
              Fantsuam <span className="text-[#1E7A34]">Foundation</span>
            </span>
          </div>

          <h2 className="font-serif text-2xl text-[#2B2B28]">Welcome back</h2>
          <p className="mt-1.5 text-sm text-[#7A7669]">
            Enter your admin credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#2B2B28]">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fantsuam.org"
                className={cn(
                  'w-full rounded-lg border border-[#DCD5C4] bg-white px-3.5 py-2.5 text-sm text-[#2B2B28]',
                  'placeholder:text-[#A8A296] outline-none transition-colors',
                  'focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/15'
                )}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#2B2B28]">
                  Password
                </label>
                <a href="/admin/forgot-password" className="text-xs font-medium text-[#1E7A34] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-lg border border-[#DCD5C4] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#2B2B28]',
                    'placeholder:text-[#A8A296] outline-none transition-colors',
                    'focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/15'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A296] hover:text-[#2B2B28]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-[#FBEAE9] px-3 py-2 text-sm text-[#B3261E]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                'bg-[#2E3192] hover:bg-[#262873] disabled:cursor-not-allowed disabled:opacity-70'
              )}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[#A8A296]">
            Having trouble signing in? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
