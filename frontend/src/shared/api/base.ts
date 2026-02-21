import { env } from '../config/env';
import { ApiResponse } from '../types';

export const apiClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = env.VITE_API_URL || '';
    const url = `${baseUrl}${endpoint}`;
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json.data;
  },

  get<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, body: any) {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body: any) {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: any) {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string) {
    return this.fetch<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
