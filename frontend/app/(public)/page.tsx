'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const benefits = [
    {
      icon: '⚡',
      title: 'Fast Approval',
      description: 'Get approved within 24 hours with our streamlined process',
    },
    {
      icon: '🔒',
      title: 'Secure & Safe',
      description: 'Your data is encrypted and protected with the highest security standards',
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your loans anytime, anywhere on any device',
    },
    {
      icon: '💰',
      title: 'Competitive Rates',
      description: 'Enjoy industry-leading interest rates and flexible repayment terms',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Apply Online',
      description: 'Fill out our simple online application form in minutes',
    },
    {
      number: '2',
      title: 'Verification',
      description: 'We verify your information and review your documents',
    },
    {
      number: '3',
      title: 'Approval',
      description: 'Receive approval decision within 24 hours',
    },
    {
      number: '4',
      title: 'Disbursement',
      description: 'Funds transferred directly to your bank account',
    },
  ];

  const testimonials = [
    {
      name: 'Amara Johnson',
      role: 'Business Owner',
      quote: 'The loan process was smooth and straightforward. I got the funds I needed to expand my business.',
      rating: 5,
    },
    {
      name: 'Chisom Nwosu',
      role: 'Farmer',
      quote: 'Agricultural loan helped me invest in better equipment. Highly recommended service.',
      rating: 5,
    },
    {
      name: 'David Okonkwo',
      role: 'Salaried Employee',
      quote: 'Best salary loan provider. Fast processing and friendly customer support.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'What are the eligibility requirements?',
      answer: 'You must be at least 18 years old, have a valid ID, and a regular source of income.',
    },
    {
      question: 'How long does approval take?',
      answer: 'Most applications are approved within 24 hours. Emergency loans can be approved same-day.',
    },
    {
      question: 'What documents do I need?',
      answer: 'Required documents vary by loan type but typically include ID, employment letter, and bank statements.',
    },
    {
      question: 'Can I repay early?',
      answer: 'Yes, you can repay your loan early without any penalties or additional charges.',
    },
    {
      question: 'Is there a processing fee?',
      answer: 'There may be a one-time processing fee depending on your loan amount and type.',
    },
    {
      question: 'How do I track my repayment?',
      answer: 'You can track your repayment schedule anytime through our online portal.',
    },
  ];

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
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm font-medium text-foreground hover:text-accent">
                Products
              </Link>
              <Link href="/apply" className="text-sm font-medium text-foreground hover:text-accent">
                Apply Now
              </Link>
              <Link href="/update-documents" className="text-sm font-medium text-foreground hover:text-accent">
                Update Documents
              </Link>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/apply">Apply Now</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Fast, Secure & Reliable Microfinance Loans
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Access affordable loans tailored to your needs. Whether you&apos;re growing your business, managing personal needs, or investing in agriculture, we&apos;ve got you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/apply">
                  Apply for Loan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/products">View Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re committed to making microfinance accessible to everyone
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple process to get your loan in 4 easy steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="absolute top-6 left-[52%] hidden md:block w-[calc(100%-24px)] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of satisfied customers
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-lg border border-border bg-card p-6">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground">
                  {faq.question}
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Ready to Get Your Loan?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Apply today and get approved in as little as 24 hours
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link href="/apply">Apply Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  MF
                </div>
                <span className="font-semibold text-foreground">MicroFinance</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Providing accessible microfinance solutions to everyone
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link></li>
                <li><Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">Products</Link></li>
                <li><Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground">Apply</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="tel:+234801234567" className="text-sm text-muted-foreground hover:text-foreground">Call Support</a></li>
                <li><a href="mailto:support@microfinance.com" className="text-sm text-muted-foreground hover:text-foreground">Email Us</a></li>
                <li><Link href="/update-documents" className="text-sm text-muted-foreground hover:text-foreground">Update Documents</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={16} /> +234 801 234 567
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={16} /> support@microfinance.com
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} /> Lagos, Nigeria
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2026 MicroFinance. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
