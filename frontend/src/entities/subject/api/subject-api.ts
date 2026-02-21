import { apiClient } from '../../../shared/api/base';
import { Subject, UpdateSubjectStatusDto, UpdateFinalDto } from '../model/types';

export interface StudentSubjectResponse {
  id: string;
  status: string;
  grade: number | null;
  enrollmentYear: number | null;
  enrollmentPeriod: number | null;
  finalDate: string | null;
  finalGrade: number | null;
  subject: {
    id: string;
    name: string;
    code: string;
    hours: number;
    year: number;
    period: number;
  };
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
};
