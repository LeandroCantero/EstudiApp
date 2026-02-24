import { useCalendar } from '@/entities/calendar/model/use-calendar';
import { CalendarDays, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const CalendarPage = () => {
  const { events, isLoading, error, deleteEvent } = useCalendar();
  const [filter, setFilter] = useState<'ALL' | 'parcial' | 'final' | 'entrega' | 'general'>('ALL');

  const filteredEvents = events.filter(e => filter === 'ALL' || e.type === filter);

  const eventTypes = [
    { id: 'ALL', label: 'Todos' },
    { id: 'parcial', label: 'Parciales', color: 'bg-amber-500' },
    { id: 'final', label: 'Finales', color: 'bg-red-500' },
    { id: 'entrega', label: 'Entregas', color: 'bg-blue-500' },
    { id: 'general', label: 'Otros', color: 'bg-slate-500' },
  ];


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-24 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-primary mb-1">
           <CalendarDays size={28} />
           <h1 className="text-3xl font-black tracking-tight uppercase">Calendario</h1>
        </div>
        <p className="text-foreground/50 text-base font-medium">Seguimiento cronológico de evaluaciones y entregas pendientes.</p>
      </header>

      {/* Filtros de Categoría */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-card border border-foreground/5 rounded-2xl shadow-inner sticky top-4 z-10 backdrop-blur-md">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id as any)}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === type.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-600 text-sm font-bold rounded-2xl border border-red-500/20 animate-in shake duration-500">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const date = new Date(event.date);
            const isPast = date.getTime() < new Date().getTime();
            
            return (
              <div
                key={event.id}
                className={`bg-card rounded-3xl p-6 shadow-sm border border-foreground/5 hover:border-primary/30 transition-all group relative overflow-hidden ${isPast ? 'opacity-60 grayscale' : ''}`}
              >
                {/* Indicador lateral de tipo */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  event.type === 'final' ? 'bg-red-500' :
                  event.type === 'parcial' ? 'bg-amber-500' :
                  event.type === 'entrega' ? 'bg-blue-500' : 'bg-slate-500'
                }`} />

                <div className="flex items-start gap-6">
                  {/* Fecha Estilizada */}
                  <div className="flex flex-col items-center justify-center bg-foreground/5 rounded-2xl p-3 min-w-[70px] border border-foreground/5">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-foreground/40">{date.toLocaleDateString('es-AR', { month: 'short' })}</span>
                    <span className="text-3xl font-black text-primary leading-none my-1">{date.getDate()}</span>
                    <span className="text-[10px] font-bold text-foreground/30 capitalize">{date.toLocaleDateString('es-AR', { weekday: 'short' })}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white ${
                          event.type === 'final' ? 'bg-red-500' :
                          event.type === 'parcial' ? 'bg-amber-500' :
                          event.type === 'entrega' ? 'bg-blue-500' : 'bg-slate-500'
                        }`}>
                          {event.type}
                        </span>
                        {isPast && <span className="text-[10px] font-black uppercase bg-foreground/10 text-foreground/40 px-2 py-0.5 rounded">Finalizado</span>}
                      </div>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-foreground/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar evento"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="font-bold text-xl mb-1 tracking-tight">{event.title}</h3>
                    
                    {event.studentSubject && (
                      <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                        {event.studentSubject.careerSubject.subject.name}
                      </div>
                    )}


                    <div className="flex items-center gap-4 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-foreground/20" />
                        <span>{date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} HS</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-foreground/50 mt-3 leading-relaxed max-w-2xl">{event.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-[40px] border-2 border-dashed border-foreground/5">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <CalendarIcon size={40} className="text-primary/20" />
            </div>
            <h3 className="font-black text-2xl uppercase tracking-tight mb-2">Calendario Despejado</h3>
            <p className="text-sm text-foreground/40 max-w-[280px] font-medium">
              No tenés eventos {filter !== 'ALL' ? `del tipo ${filter.toLowerCase()}` : 'programados'} para los próximos días.
            </p>
            {filter !== 'ALL' && (
              <button 
                onClick={() => setFilter('ALL')}
                className="mt-6 text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                Ver todos los eventos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

