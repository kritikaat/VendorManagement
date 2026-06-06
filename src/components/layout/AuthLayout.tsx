import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Building2, FileCheck2, ShieldCheck, GitMerge, Zap, Home } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg';
}

const FEATURES = [
  {
    icon: Building2,
    label: 'Vendor Management',
    description: 'Onboard, verify, and manage all your vendors in one place with full audit trails.',
  },
  {
    icon: GitMerge,
    label: 'End-to-End Procurement',
    description: 'From RFQ creation to invoice payment — every step tracked and transparent.',
  },
  {
    icon: ShieldCheck,
    label: 'Multi-level Approvals',
    description: 'Configurable approval chains with role-based access and real-time notifications.',
  },
  {
    icon: BarChart3,
    label: 'Reports & Analytics',
    description: 'Spending trends, vendor performance, and KPI dashboards at a glance.',
  },
  {
    icon: FileCheck2,
    label: 'Compliance & Audit',
    description: 'Every action is logged — stay compliant with full visibility into procurement history.',
  },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  size = 'sm',
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Left panel ── */}
      <div className="relative hidden w-[52%] flex-col border-r border-slate-200 bg-slate-50 lg:flex">
        <div className="border-b border-slate-200 bg-white px-10 py-7">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <Link to="/" className="text-lg font-bold text-slate-900">
                VendorBridge
              </Link>
              <p className="text-xs text-slate-500">Procurement & Vendor Management ERP</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-10">
          <div>
            <h2 className="max-w-md text-2xl font-semibold leading-snug text-slate-900">
              Manage procurement from RFQ to payment in one platform
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Streamline vendor onboarding, quotation comparison, multi-level approvals,
              purchase orders, and invoicing with full audit visibility.
            </p>

            <ul className="mt-8 space-y-5">
              {FEATURES.map(({ icon: Icon, label, description }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-slate-400">© 2026 VendorBridge. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col px-6 py-10 sm:px-10 lg:px-16">

        {/* Home button — top right */}
        <div className="flex justify-end mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <Link to="/" className="text-lg font-bold text-slate-900">
            VendorBridge
          </Link>
        </div>

        <div className={`mx-auto w-full my-auto ${size === 'lg' ? 'max-w-xl' : 'max-w-md'}`}>
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>

          {footer ? <div className="mt-6 text-center text-sm text-slate-500">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
