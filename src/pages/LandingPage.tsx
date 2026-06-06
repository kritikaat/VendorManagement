import { Link } from 'react-router-dom';
import {
  Zap,
  Building2,
  GitMerge,
  ShieldCheck,
  BarChart3,
  FileCheck2,
  Package,
  ArrowRight,
  CheckCircle2,
  Star,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Building2,
    title: 'Vendor Management',
    description:
      'Onboard, verify, and manage all your vendors in one place with complete audit trails and status tracking.',
  },
  {
    icon: GitMerge,
    title: 'End-to-End Procurement',
    description:
      'From RFQ creation to invoice payment — every step is tracked, transparent, and fully auditable.',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-level Approvals',
    description:
      'Configurable approval chains with role-based access control and real-time notifications at every step.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description:
      'Spending trends, vendor performance KPIs, and procurement dashboards — all in real time.',
  },
  {
    icon: FileCheck2,
    title: 'Compliance & Audit',
    description:
      'Every action is logged. Stay compliant with full visibility into your procurement history.',
  },
  {
    icon: Package,
    title: 'Purchase Orders',
    description:
      'Auto-generate purchase orders from approved quotations and track delivery timelines with ease.',
  },
];

const STATS = [
  { value: '500+', label: 'Companies onboarded' },
  { value: '12k+', label: 'Purchase orders processed' },
  { value: '98%', label: 'Fulfillment rate' },
  { value: '3x', label: 'Faster procurement cycle' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create an RFQ', desc: 'Define your requirements and assign it to relevant vendors.' },
  { step: '02', title: 'Compare Quotations', desc: 'Vendors submit quotes; compare pricing, delivery, and ratings.' },
  { step: '03', title: 'Approve & Generate PO', desc: 'Multi-level approval flow auto-generates a purchase order.' },
  { step: '04', title: 'Invoice & Pay', desc: 'Track invoices, mark payments, and maintain a complete audit trail.' },
];

const TESTIMONIALS = [
  {
    name: 'Rahul Mehta',
    role: 'Procurement Head, InfraCorp',
    text: 'VendorBridge cut our procurement cycle time by 60%. The approval workflow alone saved us weeks of back-and-forth emails.',
    rating: 5,
  },
  {
    name: 'Priya Shah',
    role: 'Finance Manager, TechNova',
    text: 'The spend analytics dashboard gives us real-time visibility we never had before. Absolutely transformed how we manage vendors.',
    rating: 5,
  },
  {
    name: 'Arjun Patel',
    role: 'Operations Lead, BuildFast',
    text: 'Onboarding vendors used to take days. Now it takes minutes. The audit trail keeps us fully compliant with zero effort.',
    rating: 5,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">VendorBridge</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-primary transition-colors">How it works</a>
            <a href="#testimonials" className="text-sm text-slate-600 hover:text-primary transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-slate-700">
              <Link to="/register">Register</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <Bell className="h-3.5 w-3.5 text-primary" /> Procurement made simple
          </span>

          <h1 className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Manage procurement{' '}
            <span className="text-primary">from RFQ to payment</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-500">
            VendorBridge streamlines vendor onboarding, quotation comparison, multi-level approvals,
            purchase orders, and invoicing — with full audit visibility in one platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/register">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link to="/login">Login to dashboard</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-slate-100 px-6 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
            <h2 className="text-3xl font-bold text-slate-900">Everything you need in one place</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              A complete procurement suite built for modern teams — from startups to enterprises.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-y border-slate-100 bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Process</p>
            <h2 className="text-3xl font-bold text-slate-900">How VendorBridge works</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              A simple, structured workflow that takes you from requirement to payment in four steps.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="mb-3 block text-3xl font-extrabold text-slate-100">{item.step}</span>
                <h3 className="mb-1.5 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</p>
            <h2 className="text-3xl font-bold text-slate-900">Trusted by procurement teams</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-slate-600">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-y border-slate-100 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900">Ready to streamline your procurement?</h2>
          <p className="mb-8 text-slate-500">
            Join hundreds of companies using VendorBridge to manage vendors, approvals, and spend — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/register">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-700">VendorBridge</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 VendorBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
