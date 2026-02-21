import { apiClient } from '../../../shared/api/base';
import { UpdateFinalDto, UpdateSubjectStatusDto } from '../model/types';

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
