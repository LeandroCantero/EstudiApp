
import { BookMarked, BookOpen, Calendar, Home } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/materias', icon: BookOpen, label: 'Materias' },
  { to: '/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/recursos', icon: BookMarked, label: 'Recursos' },
];
