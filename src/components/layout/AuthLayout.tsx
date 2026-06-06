import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg';
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  size = 'sm',
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 text-center">
        <Link to="/login" className="text-2xl font-semibold tracking-tight text-foreground">
          Vendor<span className="text-emerald-400">Bridge</span>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Procurement &amp; Vendor Management ERP
        </p>
      </div>

      <div
        className={`w-full rounded-lg border border-border bg-card p-8 shadow-sm ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="mb-6 flex flex-col items-center">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarFallback className="bg-secondary text-base text-muted-foreground">
              Photo
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        {children}
      </div>

      {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
