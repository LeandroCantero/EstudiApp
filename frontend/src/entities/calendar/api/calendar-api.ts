import { apiClient } from '@/shared/api/base';
import { CalendarEvent, CreateEventDto } from '../model/types';

export const calendarApi = {
  getEvents: (startDate?: string, endDate?: string): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<CalendarEvent[]>(`/calendar?${params.toString()}`);
  },

  createEvent: (data: CreateEventDto): Promise<CalendarEvent> => {
    return apiClient.post<CalendarEvent>('/calendar/events', data);
  },

  deleteEvent: (id: string): Promise<void> => {
    return apiClient.delete(`/calendar/events/${id}`);
  }
};
