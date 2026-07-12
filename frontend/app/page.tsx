// app/page.tsx
// FULL FILE — Fantsuam Foundation landing page

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Landmark,
  Wifi,
  HeartPulse,
  Users,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Upload,
  Banknote,
} from 'lucide-react';

const STATS = [
  { value: '₦200M+', label: 'Disbursed in microloans yearly' },
  { value: '3,000+', label: 'Women reached every year' },
  { value: '4,000+', label: 'Trained through Gaiya volunteering' },
  { value: 'Since 1996', label: 'Serving rural Kaduna State' },
];

const PROGRAMS = [
  {
    icon: Landmark,
    name: 'Microfinance',
    description:
      'Small business loans for rural women and youth, paired with training in financial management so income growth lasts beyond the loan cycle.',
  },
  {
    icon: Wifi,
    name: 'ZittNet',
    description:
      "Solar-powered wireless internet — the only service of its kind across rural northern Nigeria — connecting Kafanchan's homes, schools, and small businesses.",
  },
  {
    icon: HeartPulse,
    name: 'Health',
    description:
      "A community clinic born out of the microfinance program itself, supporting borrowers' health so a setback never has to mean a missed repayment.",
  },
  {
    icon: Users,
    name: 'Gaiya Volunteering',
    description:
      'A national volunteering program that has trained thousands of people, building local capacity long after any single project ends.',
  },
];

const STEPS = [
  { icon: FileText, title: 'Apply', text: 'Tell us about yourself and the loan you need — takes about ten minutes.' },
  { icon: UserCheck, title: 'Add a guarantor', text: 'Provide a reference who can vouch for your repayment plan.' },
  { icon: Upload, title: 'Upload documents', text: 'ID, proof of address, and income — verified quickly by our team.' },
  { icon: Banknote, title: 'Get funded', text: 'Approved loans are disbursed directly to your account.' },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 shrink-0">
              <Image src="/logo.png" alt="Fantsuam Foundation logo" fill className="object-contain" priority />
            </div>
            <span className="text-sm font-semibold text-foreground">Fantsuam Foundation</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#programs" className="text-sm text-muted-foreground hover:text-foreground">Programs</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
          </nav>
          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply for a loan <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* signature element — radiating ochre arc, echoes the sun in the mark */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, var(--accent), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8 lg:pt-28">
          <span className="inline-block rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Rural development since 1996 · Kafanchan, Kaduna State
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
            Capital for the women and youth building rural Nigeria
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Fantsuam Foundation pairs microloans with training, health support, and community connectivity —
            so a loan is the start of something that lasts, not just a transaction.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Apply for a loan <ArrowRight size={15} />
            </Link>
            <a
              href="#programs"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted sm:w-auto"
            >
              See our programs
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">One foundation, four ways it shows up</h2>
          <p className="mt-3 text-muted-foreground">
            Microfinance rarely works in isolation. These are the programs that make repayment realistic and
            growth durable for the households we serve.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PROGRAMS.map((program) => (
            <div key={program.name} className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <program.icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{program.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{program.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Applying takes four steps</h2>
            <p className="mt-3 text-muted-foreground">No branch visit required to get started.</p>
          </div>
          <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
              style={{ marginInline: '12.5%' }}
            />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background text-primary ring-2 ring-primary">
                  <step.icon size={18} />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / impact */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold">Built by the community it serves</h2>
            <p className="mt-4 text-muted-foreground">
              Fantsuam Foundation started as a small lending program with twenty-five clients and grew into an
              integrated rural development organization — because the women repaying their loans kept surfacing
              needs a loan alone couldn&apos;t meet: reliable internet, basic healthcare, a next generation of
              trained volunteers.
            </p>
            <p className="mt-4 text-muted-foreground">
              Today, most of our operating budget is earned through these same services rather than donated,
              which is the model we&apos;re most proud of: aid that becomes self-sustaining.
            </p>
            <ul className="mt-6 space-y-2.5">
              {['Women-led lending groups', 'Solar-powered rural infrastructure', 'Health support tied to loan repayment', 'Locally governed by a community board'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 size={16} className="shrink-0 text-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Our mission</p>
            <p className="mt-3 text-xl font-serif text-primary">
              To eliminate poverty and disadvantage among rural women and youth through integrated programs of
              wealth and job creation.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={15} />
              Kafanchan, Kaduna State, Nigeria
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center sm:px-14">
          <h2 className="font-serif text-3xl font-bold text-primary-foreground">Ready to grow your business?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
            Start your loan application today — it takes about ten minutes and you can save your progress
            and come back anytime.
          </p>
          <Link
            href="/apply"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            Apply for a loan <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0">
                <Image src="/logo.png" alt="Fantsuam Foundation logo" fill className="object-contain" />
              </div>
              <span className="text-sm font-semibold text-foreground">Fantsuam Foundation</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> Kafanchan, Kaduna State
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> Contact via our office
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> info@fantsuam.org
              </span>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fantsuam Foundation. A non-profit rural development organization.
          </p>
        </div>
      </footer>
    </main>
  );
}