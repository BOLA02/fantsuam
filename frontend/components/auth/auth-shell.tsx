// components/auth/auth-shell.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, HeartHandshake, ShieldCheck, Sprout } from 'lucide-react';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  admin?: boolean;
};

export function AuthShell({ eyebrow, title, description, children, footer, admin = false }: AuthShellProps) {
  return (
   <main className="min-h-screen bg-[#F8F6F0]">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(0,0.94fr)_minmax(480px,1.06fr)]">
        <section className="flex items-center justify-center bg-[#F8F6F0] px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-[430px]">
          

<Link href="/" className="mb-10 flex justify-center" aria-label="Fantsuam Foundation home">
  <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border-2 border-[#E5DDCB] bg-white p-1.5 shadow-md">
    <Image src="/LOGO.jpg" alt="Fantsuam Foundation" width={88} height={88} className="h-full w-full object-contain" priority />
  </span>
</Link>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E7A34]">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.08] text-[#25245D] sm:text-[2.75rem]">{title}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#625E55]">{description}</p>
            <div className="mt-9">{children}</div>
            {footer && <div className="mt-7">{footer}</div>}
          </div>
        </section>

         <aside className="relative hidden overflow-hidden bg-[#1E2A5A] lg:flex lg:flex-col">
          {/* contour rings, echoing the logo's ring motif */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 600 900" fill="none" preserveAspectRatio="xMidYMid slice">
            <circle cx="540" cy="90" r="140" stroke="#4A9B5E" strokeOpacity="0.35" strokeWidth="10" />
            <circle cx="540" cy="90" r="190" stroke="#4A9B5E" strokeOpacity="0.18" strokeWidth="6" />
            <circle cx="70" cy="430" r="120" stroke="#F4C95D" strokeOpacity="0.22" strokeWidth="8" />
            <circle cx="520" cy="760" r="170" stroke="#F4C95D" strokeOpacity="0.14" strokeWidth="6" />
            <circle cx="520" cy="760" r="220" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
            <path d="M-20 300 C 160 240, 380 380, 620 300" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
            <path d="M-20 620 C 160 560, 380 700, 620 620" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <HeartHandshake size={18} className="text-[#7BC98C]" /> Community-powered progress
            </div>

            <div className="max-w-lg">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
                <Sprout size={28} className="text-[#F4C95D]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7BC98C]">
                {admin ? 'Staff workspace' : 'Member portal'}
              </p>
              <h2 className="mt-4 font-serif text-[2.6rem] leading-[1.12] text-white">
                Building resilient communities, together.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/60">
                From microloans to shared knowledge, every step is designed around dignity, access and lasting opportunity.
              </p>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/12 pt-8">
                {['Access', 'Dignity', 'Opportunity'].map((item, index) => (
                  <div key={item}>
                    <span className="text-xs font-semibold text-white/40">0{index + 1}</span>
                    <p className="mt-1.5 text-sm font-semibold text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/12 pt-6 text-sm text-white/60">
              <span>Fantsuam Foundation</span>
              <span className="flex items-center gap-2">
                Trusted care <ShieldCheck size={17} className="text-[#7BC98C]" />
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function AuthInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-[#3D3A35]">{label}</span><input {...props} className="w-full rounded-xl border border-[#DDD5C6] bg-[#FFFEFB] px-4 py-3 text-sm text-[#2B2B28] outline-none transition placeholder:text-[#AAA394] focus:border-[#2E3192] focus:ring-4 focus:ring-[#2E3192]/10" /></label>;
}

export function PrimaryAuthButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E3192] px-4 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(46,49,146,0.22)] transition hover:-translate-y-0.5 hover:bg-[#22246F] disabled:cursor-not-allowed disabled:opacity-60">{children}<ArrowUpRight size={17} /></button>;
}