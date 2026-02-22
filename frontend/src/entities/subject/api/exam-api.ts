import { apiClient } from '@/shared/api/base';
import { CreateExamDto, Exam, UpdateExamDto } from '../model/types';

export const examApi = {
  getBySubject: (studentSubjectId: string): Promise<Exam[]> => {
    return apiClient.get<Exam[]>(`/exams/subject/${studentSubjectId}`);
  },

  create: (studentSubjectId: string, data: CreateExamDto): Promise<Exam> => {
    return apiClient.post<Exam>(`/exams/subject/${studentSubjectId}`, data);
  },

  update: (id: string, data: UpdateExamDto): Promise<Exam> => {
    return apiClient.patch<Exam>(`/exams/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete(`/exams/${id}`);
  }
};
