import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'VB';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
      <span className="text-base font-semibold text-slate-900 lg:hidden">VendorBridge</span>
      <div className="hidden flex-1 lg:block" />
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs capitalize text-slate-500">{user?.role.replace('_', ' ')}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-slate-800 text-xs font-medium text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-4 w-4 text-slate-500" />
        </Button>
      </div>
    </header>
  );
}
