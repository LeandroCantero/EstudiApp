import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  description?: string;
}

export const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Connect to API
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Parcial de Matemática',
        type: 'parcial',
        date: '2024-06-15',
        description: 'Primera evaluación parcial',
      },
      {
        id: '2',
        title: 'Entrega TP Programación',
        type: 'entrega',
        date: '2024-06-20',
        description: 'Trabajo práctico grupal',
      },
    ];
    setEvents(mockEvents);
    setIsLoading(false);
  }, []);

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

      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarIcon size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary px-2 py-1 bg-primary/10 rounded-lg">
                    {event.type}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{event.date}</span>
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-foreground/60 mt-2">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
