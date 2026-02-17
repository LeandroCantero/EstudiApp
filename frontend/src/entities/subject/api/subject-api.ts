import { apiClient } from '../../../shared/api/base';
import { AcademicMetrics, CreateSubjectDto, Subject, UpdateSubjectDto } from '../model/types';

export const subjectApi = {
  getAll: (userId: string) => 
    apiClient.get<Subject[]>(`/subjects?userId=${userId}`),
  
  getMetrics: (userId: string) => 
    apiClient.get<AcademicMetrics>(`/subjects/metrics?userId=${userId}`),
  
  create: (data: CreateSubjectDto) => 
    apiClient.post<Subject>('/subjects', data),
  
  update: (id: string, data: UpdateSubjectDto) => 
    apiClient.fetch<Subject>(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  remove: (id: string) => 
    apiClient.fetch<void>(`/subjects/${id}`, { method: 'DELETE' }),
};
