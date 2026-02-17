
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../app/providers/theme-provider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-foreground/5 text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all duration-200"
      aria-label="Cambiar tema"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};
