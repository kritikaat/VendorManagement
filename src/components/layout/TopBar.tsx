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
    navigate('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <span className="text-lg font-semibold tracking-tight lg:hidden">
        Vendor<span className="text-emerald-400">Bridge</span>
      </span>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs capitalize text-muted-foreground">
            {user?.role.replace('_', ' ')}
          </p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
