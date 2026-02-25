import { CalendarEvent } from '@/entities/calendar/model/types';
import { Calendar, Clock } from 'lucide-react';

interface AcademicTimelineProps {
  events: CalendarEvent[];
}

export const AcademicTimeline = ({ events }: AcademicTimelineProps) => {
  if (events.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-foreground/5 text-center">
        <Calendar className="mx-auto text-foreground/10 mb-2" size={32} />
        <p className="text-sm font-medium text-foreground/40">No hay eventos próximos</p>
      </div>
    );
  }

  // Filter and sort events by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-foreground/5 text-center">
        <Calendar className="mx-auto text-foreground/10 mb-2" size={32} />
        <p className="text-sm font-medium text-foreground/40">No hay eventos próximos</p>
      </div>
    );
  }

  const getEventBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'parcial':
      case 'parcial 1':
      case 'parcial 2':
      case 'recuperatorio':
        return 'bg-blue-500/10 text-blue-500';
      case 'final':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-foreground/10 text-foreground/60';
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30 px-1">Próximos Eventos</h3>
      <div className="flex flex-col gap-3">
        {upcomingEvents.slice(0, 5).map((event, index) => {
          const eventDate = new Date(event.date);

          return (
            <div 
              key={event.id} 
              className="relative flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-1 bg-card border border-foreground/5 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start mb-2">
                   <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getEventBadgeColor(event.type)}`}>
                    {event.type}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/30 uppercase">
                    <Clock size={10} />
                    {eventDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{event.title}</h4>
                
                {event.studentSubject && (
                  <p className="text-[10px] font-bold text-foreground/40 mt-1 uppercase tracking-tighter">
                    {event.studentSubject.careerSubject.subject.name}
                  </p>
                )}
                
                {event.description && (
                  <p className="text-xs text-foreground/50 mt-2 line-clamp-2 leading-relaxed italic border-l-2 border-foreground/5 pl-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
