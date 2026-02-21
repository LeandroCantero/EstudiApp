import { GraduationCap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useUser } from '@/entities/user/model/use-user';
import { ThemeToggle } from '../../shared/ui/theme-toggle';
import { NAV_ITEMS } from './nav-config';

export const Sidebar = () => {
  const { user } = useUser();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card h-screen sticky top-0">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Curs</span>App
        </h1>
        <ThemeToggle />
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-foreground/5 rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Estudiante</p>
          <p className="text-sm font-semibold truncate">{user?.name || 'Invitado'}</p>
          <div className="flex items-center gap-1.5 text-foreground/40">
            <GraduationCap size={12} />
            <span className="text-[10px] font-medium truncate uppercase tracking-widest leading-none">
              {user?.career?.name || 'Sin Carrera'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
