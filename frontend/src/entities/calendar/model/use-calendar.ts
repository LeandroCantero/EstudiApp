import { useCallback, useEffect, useState } from 'react';
import { calendarApi } from '../api/calendar-api';
import { CalendarEvent, CreateEventDto } from './types';

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await calendarApi.getEvents(startDate, endDate);
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los eventos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEvent = async (dto: CreateEventDto) => {
    setIsLoading(true);
    try {
      const newEvent = await calendarApi.createEvent(dto);
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      return newEvent;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear el evento';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await calendarApi.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError('Error al eliminar el evento');
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refresh: fetchEvents,
    createEvent,
    deleteEvent,
  };
};
