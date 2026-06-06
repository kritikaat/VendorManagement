import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getNavItemsForRole } from '@/constants/navItems';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const { user } = useAuth();
  const navItems = getNavItemsForRole(user?.role ?? '');

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-14 items-center border-b border-border px-6">
        <span className="text-lg font-semibold tracking-tight">
          Vendor<span className="text-emerald-400">Bridge</span>
        </span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border border-emerald-500/50 bg-emerald-500/10 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
