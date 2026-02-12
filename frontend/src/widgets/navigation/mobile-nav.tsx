
import { BookMarked, BookOpen, Calendar, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-foreground/5 backdrop-blur-lg px-6 py-3 flex justify-between items-center z-50 md:hidden">
      <NavItem to="/" icon={<Home size={24} />} label="Inicio" />
      <NavItem to="/materias" icon={<BookOpen size={24} />} label="Materias" />
      <NavItem to="/calendario" icon={<Calendar size={24} />} label="Calendario" />
      <NavItem to="/recursos" icon={<BookMarked size={24} />} label="Recursos" />
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors ${
          isActive ? 'text-primary' : 'text-foreground/60'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
};
