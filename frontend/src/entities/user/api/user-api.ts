import { apiClient } from '@/shared/api/base';
import { Career } from '@/entities/career/api/career-api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  career: Career | null;
  createdAt: string;
}

export interface UpdateUserDto {
  name?: string;
  career?: string;
}

export const userApi = {
  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  getById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  updateMe: async (data: UpdateUserDto): Promise<User> => {
    return apiClient.fetch<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  setupCareer: async (careerId: string): Promise<{ user: User; subjectsCount: number }> => {
    return apiClient.post<{ user: User; subjectsCount: number }>('/users/setup-career', { careerId });
  },

  getDashboard: async (): Promise<any> => {
    return apiClient.get('/users/dashboard');
  },

  getCredits: async (): Promise<{ total: number; credits: any[] }> => {
    return apiClient.get('/users/credits');
  },
};
