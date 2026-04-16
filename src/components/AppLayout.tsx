import { NavLink, useNavigate } from 'react-router-dom';
import { Film, LayoutDashboard, List, Upload, Settings, LogOut, Compass } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/discover', icon: Compass, label: 'Descobrir' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/movies', icon: List, label: 'Watchlist' },
  { to: '/history', icon: Film, label: 'Assistidos' },
  { to: '/import', icon: Upload, label: 'Importar' },
  { to: '/settings', icon: Settings, label: 'Config' },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-border bg-card/80 backdrop-blur-xl py-6 gap-2 md:w-56 md:items-start md:px-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="hidden md:block font-heading text-sm font-bold text-foreground tracking-tight">
            Ohmov1es
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 w-full">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden md:block font-body">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden md:block font-body">Sair</span>
        </button>
      </aside>

      <main className="flex-1 ml-16 md:ml-56 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
