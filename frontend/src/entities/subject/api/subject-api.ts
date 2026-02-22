import { apiClient } from '../../../shared/api/base';
import { CreateNoteDto, SubjectNote, UpdateFinalDto, UpdateSubjectStatusDto } from '../model/types';

export interface StudentSubjectResponse {
  id: string;
  status: string;
  courseGrade: number | null;
  finalGrade: number | null;
  careerSubject: {
    code: string;
    year: number | null;
    period: number | null;
    subject: {
      id: string;
      name: string;
      hours: number;
    };
  };
  attemptCount: number;
}

export const subjectApi = {
  /** Get all subjects for the current authenticated user */
  getMySubjects: () => 
    apiClient.get<StudentSubjectResponse[]>('/my-subjects'),
  
  /** Update subject status (e.g., from PENDIENTE to EN_CURSO) */
  updateStatus: (id: string, data: UpdateSubjectStatusDto) => 
    apiClient.patch<StudentSubjectResponse>(`/my-subjects/${id}/status`, data),
  
  /** Update final exam information */
  updateFinal: (id: string, data: UpdateFinalDto) => 
    apiClient.post<StudentSubjectResponse>(`/my-subjects/${id}/final`, data),
  
  /** Get subject details by ID */
  getById: (id: string) => 
    apiClient.get<StudentSubjectResponse>(`/my-subjects/${id}`),

  /** US-04: Get notes for a subject */
  getNotes: (studentSubjectId: string) => 
    apiClient.get<SubjectNote[]>(`/notes/subject/${studentSubjectId}`),

  /** US-04: Create a note for a subject */
  createNote: (studentSubjectId: string, data: CreateNoteDto) => 
    apiClient.post<SubjectNote>(`/notes/subject/${studentSubjectId}`, data),

  /** Delete a note */
  deleteNote: (id: string) => 
    apiClient.delete(`/notes/${id}`),
};
