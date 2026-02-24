import { CalendarEvent } from '@/entities/calendar/model/types';
import { Calendar, Clock, FileText, GraduationCap } from 'lucide-react';

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

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'parcial':
      case 'parcial 1':
      case 'parcial 2':
      case 'recuperatorio':
        return <FileText size={16} />;
      case 'final':
        return <GraduationCap size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

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
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30 px-1">Próximos Hitos</h3>
      <div className="relative pl-4 flex flex-col gap-6">
        {/* Vertical Line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-foreground/5" />

        {sortedEvents.slice(0, 5).map((event, index) => {
          const eventDate = new Date(event.date);
          const isToday = new Date().toDateString() === eventDate.toDateString();

          return (
            <div key={event.id} className="relative flex gap-4 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Dot */}
              <div className={`absolute -left-4 w-4 h-4 rounded-full border-4 border-card z-10 ${
                isToday ? 'bg-primary ring-4 ring-primary/20' : 'bg-foreground/20'
              }`} />

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
