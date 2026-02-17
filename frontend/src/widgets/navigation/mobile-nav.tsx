import { NavLink } from 'react-router-dom';
import { ThemeToggle } from '../../shared/ui/theme-toggle';
import { NAV_ITEMS } from './nav-config';

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg px-6 py-3 flex justify-between items-center z-50 md:hidden">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.to} to={item.to} icon={<item.icon size={24} />} label={item.label} />
      ))}
      <div className="flex items-center">
        <ThemeToggle />
      </div>
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
