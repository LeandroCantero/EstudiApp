import { Career } from '@/entities/career/api/career-api';
import { apiClient } from '@/shared/api/base';

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
  getMe: () => apiClient.fetch<User>('/users/me'),
  getById: (id: string) => apiClient.fetch<User>(`/users/${id}`),
  updateMe: (data: UpdateUserDto) => 
    apiClient.fetch<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateUserDto) => 
    apiClient.fetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
