export interface CalendarEvent {
  id: string;
  userId: string;
  studentSubjectId?: string;
  title: string;
  type: 'parcial' | 'final' | 'entrega' | 'general';
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  studentSubject?: {
    careerSubject: {
      subject: {
        name: string;
      };
    };
  };
}

export interface CreateEventDto {
  title: string;
  type: string;
  date: string;
  description?: string;
  studentSubjectId?: string;
}
