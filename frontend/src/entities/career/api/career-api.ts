import { apiClient } from '@/shared/api/base';

export interface TemplateSubject {
  id: string;
  code: string;
  year: number | null;
  period: number | null;
  subject: {
    id: string;
    name: string;
    hours: number;
  };
}

export interface Career {
  id: string;
  name: string;
  institute: string | null;
  duration: number | null;
  subjects?: TemplateSubject[];
}

export const careerApi = {
  getAll: () => apiClient.fetch<Career[]>('/careers'),
  getById: (id: string) => apiClient.fetch<Career>(`/careers/${id}`),
};
