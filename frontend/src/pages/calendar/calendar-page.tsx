import { useCalendar } from '@/entities/calendar/model/use-calendar';
import { Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';

export const CalendarPage = () => {
  const { events, isLoading, error, deleteEvent } = useCalendar();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-foreground/60 text-sm">Próximos eventos y evaluaciones</p>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 group relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-1 bg-primary/10 rounded-lg">
                      {event.type}
                    </span>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  
                  {event.studentSubject && (
                    <p className="text-xs font-medium text-primary mb-2">
                      {event.studentSubject.careerSubject.subject.name}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(event.date).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-sm text-foreground/60 mt-2 line-clamp-2">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-dashed border-foreground/10">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon size={32} className="text-primary/30" />
            </div>
            <h3 className="font-medium text-lg mb-1">Tu calendario está vacío</h3>
            <p className="text-sm text-foreground/60 max-w-[240px]">
              No tenés eventos ni exámenes programados por el momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
