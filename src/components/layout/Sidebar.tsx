import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getNavItemsForRole } from '@/constants/navItems';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const { user } = useAuth();
  const navItems = getNavItemsForRole(user?.role ?? '');

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-14 items-center border-b border-slate-200 px-5">
        <span className="text-base font-semibold tracking-tight text-slate-900">VendorBridge</span>
      </div>
      <nav className="p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-2 border-emerald-700 bg-emerald-50 pl-[10px] text-emerald-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
