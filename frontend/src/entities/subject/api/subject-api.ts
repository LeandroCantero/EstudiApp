import { apiClient } from '../../../shared/api/base';
import { CreateNoteDto, SubjectNote, UpdateFinalDto, UpdateSubjectStatusDto } from '../model/types';

export interface TransitionWarning {
  code: string;
  severity: 'info' | 'warn' | 'block';
  message: string;
}

export interface StudentSubjectResponse {
  id: string;
  status: string;
  courseGrade: number | null;
  finalGrade: number | null;
  careerSubject: {
    id: string;
    code: string;
    year: number | null;
    period: number | null;
    subject: {
      id: string;
      name: string;
      hours: number;
    };
    prerequisites: {
      id: string;
      code: string;
    }[];
  };
  attemptCount: number;
  completionYear: number | null;
  completionPeriod: number | null;
  transitionWarnings?: TransitionWarning[];
}

export interface StatusPreviewResponse {
  allowed: boolean;
  nextStatus: string;
  warnings: TransitionWarning[];
}

export const subjectApi = {
  getMySubjects: () => apiClient.get<StudentSubjectResponse[]>('/my-subjects'),

  updateStatus: (id: string, data: UpdateSubjectStatusDto) =>
    apiClient.patch<StudentSubjectResponse>(`/my-subjects/${id}/status`, data),

  previewStatusChange: (id: string, data: UpdateSubjectStatusDto) =>
    apiClient.post<StatusPreviewResponse>(`/my-subjects/${id}/status/preview`, data),

  updateFinal: (id: string, data: UpdateFinalDto) => apiClient.post<StudentSubjectResponse>(`/my-subjects/${id}/final`, data),

  getById: (id: string) => apiClient.get<StudentSubjectResponse>(`/my-subjects/${id}`),

  getNotes: (studentSubjectId: string) => apiClient.get<SubjectNote[]>(`/notes/subject/${studentSubjectId}`),

  createNote: (studentSubjectId: string, data: CreateNoteDto) =>
    apiClient.post<SubjectNote>(`/notes/subject/${studentSubjectId}`, data),

  deleteNote: (id: string) => apiClient.delete(`/notes/${id}`),

  resetSubject: (id: string, resetAttempts?: boolean) =>
    apiClient.post<StudentSubjectResponse>(`/my-subjects/${id}/reset`, { resetAttempts }),

  getAlerts: () => apiClient.get<any[]>('/my-subjects/alerts'),
};
