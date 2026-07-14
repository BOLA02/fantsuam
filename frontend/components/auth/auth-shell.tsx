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
    <main className="min-h-screen bg-[#F8F6F0] p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden rounded-[2rem] border border-[#E6E0D3] bg-white shadow-[0_24px_70px_rgba(46,49,146,0.10)] lg:grid-cols-[minmax(0,0.94fr)_minmax(480px,1.06fr)]">
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-[430px]">
            <Link href="/" className="mb-12 inline-flex items-center gap-3" aria-label="Fantsuam Foundation home">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-[#E5DDCB] bg-white shadow-sm">
                <Image src="/LOGO.jpg" alt="Fantsuam Foundation" width={52} height={52} className="h-full w-full object-contain" priority />
              </span>
              <span>
                <span className="block font-serif text-xl leading-none text-[#2E3192]">Fantsuam</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.19em] text-[#1E7A34]">Foundation</span>
              </span>
            </Link>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E7A34]">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.08] text-[#25245D] sm:text-[2.75rem]">{title}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#625E55]">{description}</p>
            <div className="mt-9">{children}</div>
            {footer && <div className="mt-7">{footer}</div>}
          </div>
        </section>

        <aside className="relative hidden overflow-hidden bg-[#2E3192] p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 18%, #B9D86B 0 2px, transparent 2.5px), radial-gradient(circle at 78% 72%, #ffffff 0 1px, transparent 1.5px)', backgroundSize: '30px 30px, 24px 24px' }} />
          <div className="absolute -right-24 top-14 h-80 w-80 rounded-full border-[48px] border-[#1E7A34]/70" />
          <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[#F4C95D]/20 blur-2xl" />
          <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-white/80"><HeartHandshake size={18} className="text-[#B9D86B]" /> Community-powered progress</div>

          <div className="relative z-10 my-10 max-w-lg">
            <div className="rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-sm xl:p-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B9D86B]">{admin ? 'Staff workspace' : 'Member portal'}</p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight text-white">Building resilient communities, together.</h2>
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#F4C95D] text-[#2E3192]"><Sprout size={27} /></div>
              </div>
              <div className="mt-9 grid grid-cols-3 gap-3 border-t border-white/15 pt-6 text-white">
                {['Access', 'Dignity', 'Opportunity'].map((item, index) => <div key={item}><span className="text-xs text-white/60">0{index + 1}</span><p className="mt-1 text-sm font-semibold">{item}</p></div>)}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-sm text-white/75"><span>Fantsuam Foundation</span><span className="flex items-center gap-2">Trusted care <ShieldCheck size={17} className="text-[#B9D86B]" /></span></div>
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
