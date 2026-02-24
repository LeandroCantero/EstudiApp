
import { BookMarked, BookOpen, Calendar, Home, Network } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/mapa', icon: Network, label: 'Mapa' },
  { to: '/materias', icon: BookOpen, label: 'Materias' },
  { to: '/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/recursos', icon: BookMarked, label: 'Recursos' },
];

