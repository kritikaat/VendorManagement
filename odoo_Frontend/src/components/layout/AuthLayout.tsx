import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Building2, FileCheck2 } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg';
}

const AUTH_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    alt: 'Modern office workspace',
    caption: 'Centralized procurement operations',
  },
  {
    src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    alt: 'Supply chain and logistics',
    caption: 'Vendor & supply chain management',
  },
  {
    src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
    alt: 'Business team collaboration',
    caption: 'Approval workflows & collaboration',
  },
];

const FEATURES = [
  { icon: Building2, label: 'Vendor management' },
  { icon: FileCheck2, label: 'RFQ to invoice flow' },
  { icon: BarChart3, label: 'Reports & analytics' },
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
      {/* Left — brand & imagery */}
      <div className="relative hidden w-[52%] flex-col border-r border-slate-200 bg-slate-50 lg:flex">
        <div className="border-b border-slate-200 bg-white px-10 py-8">
          <Link to="/login" className="text-xl font-semibold tracking-tight text-slate-900">
            VendorBridge
          </Link>
          <p className="mt-1 text-sm text-slate-500">Procurement & Vendor Management ERP</p>
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

            <ul className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-emerald-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <div className="col-span-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <img
                src={AUTH_IMAGES[0]!.src}
                alt={AUTH_IMAGES[0]!.alt}
                className="h-44 w-full object-cover"
              />
              <p className="px-3 py-2 text-xs text-slate-500">{AUTH_IMAGES[0]!.caption}</p>
            </div>
            {AUTH_IMAGES.slice(1).map((image) => (
              <div
                key={image.alt}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <img src={image.src} alt={image.alt} className="h-28 w-full object-cover" />
                <p className="px-2 py-1.5 text-[11px] text-slate-500">{image.caption}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-400">© 2026 VendorBridge. All rights reserved.</p>
        </div>
      </div>

      {/* Right — login / register form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mb-8 lg:hidden">
          <Link to="/login" className="text-xl font-semibold text-slate-900">
            VendorBridge
          </Link>
        </div>

        <div className={`mx-auto w-full ${size === 'lg' ? 'max-w-xl' : 'max-w-md'}`}>
          <div className="mb-8">
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
