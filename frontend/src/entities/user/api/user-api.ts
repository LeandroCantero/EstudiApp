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

// Backend User API removed. This file now only provides Types or Mock placeholders.

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
  // Mock methods that do nothing or throw, to prevent usage
  getMe: async () => { throw new Error('Backend Auth removed'); },
  getById: async () => { throw new Error('Backend Auth removed'); },
  updateMe: async () => { throw new Error('Backend Auth removed'); },
  update: async () => { throw new Error('Backend Auth removed'); },
};
