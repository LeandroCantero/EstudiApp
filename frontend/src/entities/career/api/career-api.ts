import { apiClient } from '@/shared/api/base';

export interface Career {
  id: string;
  name: string;
  institute: string | null;
  duration: number | null;
}

export const careerApi = {
  getAll: () => apiClient.fetch<Career[]>('/careers'),
  getById: (id: string) => apiClient.fetch<Career>(`/careers/${id}`),
};
