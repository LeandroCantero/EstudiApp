import { useSubjects } from '@/entities/subject/model/use-subjects';
import { BookMarked, CalendarDays, Command, Layout, Map, Search, X } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { subjects } = useSubjects();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredSubjects = subjects
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.code.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const actions = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layout size={16} />, path: '/' },
    { id: 'map', label: 'Mapa de Carrera', icon: <Map size={16} />, path: '/mapa' },
    { id: 'subjects', label: 'Mis Materias', icon: <Command size={16} />, path: '/materias' },
    { id: 'calendar', label: 'Calendario', icon: <CalendarDays size={16} />, path: '/calendario' },
    { id: 'resources', label: 'Recursos', icon: <BookMarked size={16} />, path: '/recursos' },
  ];


  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-start justify-center pt-[15vh] p-4">
      <div 
        className="bg-card/50 border border-foreground/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-foreground/5 flex items-center gap-4">
          <Search className="text-foreground/40" size={20} />
          <input 
            autoFocus
            type="text" 
            placeholder="Buscar materias o secciones... (Ctrl + K)"
            className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-foreground/20"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-foreground/5 rounded-xl transition-colors text-foreground/40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {query.length === 0 && (
            <div className="flex flex-col gap-1 mb-4">
              <h3 className="text-[10px] font-black uppercase text-foreground/30 px-3 py-2 tracking-widest">Secciones Rápidas</h3>
              {actions.map(action => (
                <button 
                  key={action.id}
                  onClick={() => handleNavigate(action.path)}
                  className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-primary/10 text-foreground/70 hover:text-primary transition-all group"
                >
                  <div className="p-2 bg-foreground/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                    {action.icon}
                  </div>
                  <span className="font-bold text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h3 className="text-[10px] font-black uppercase text-foreground/30 px-3 py-2 tracking-widest">
              {query.length > 0 ? 'Resultados de Materias' : 'Materias Recientes'}
            </h3>
            {filteredSubjects.length === 0 ? (
              <p className="text-center py-8 text-xs text-foreground/20 italic">No se encontraron materias</p>
            ) : (
              filteredSubjects.map(subject => (
                <button 
                  key={subject.id}
                  onClick={() => handleNavigate(`/subject/${subject.id}`)}
                  className="flex flex-col w-full p-3 rounded-2xl hover:bg-primary/10 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black bg-foreground/5 px-2 py-0.5 rounded text-foreground/40 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {subject.code}
                    </span>
                    <span className="font-bold text-sm group-hover:text-primary">{subject.name}</span>
                  </div>
                  <span className="text-[10px] text-foreground/30 px-0.5 uppercase font-bold">
                    Año {subject.year} • Cuatrimestre {subject.period === 0 ? 'Anual' : subject.period}
                  </span>

                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-3 bg-foreground/5 border-t border-foreground/5 flex items-center justify-between text-[10px] font-black text-foreground/30 uppercase tracking-tighter">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="bg-card px-1.5 py-0.5 rounded border border-foreground/10 text-xs">↑↓</kbd>
              Navegar
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="bg-card px-1.5 py-0.5 rounded border border-foreground/10 text-xs">Enter</kbd>
              Seleccionar
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="bg-card px-1.5 py-0.5 rounded border border-foreground/10 text-xs">Esc</kbd>
            Cerrar
          </div>
        </div>
      </div>
    </div>
  );
};
