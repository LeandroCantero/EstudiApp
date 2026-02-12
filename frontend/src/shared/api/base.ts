import { env } from '../config/env';
import { ApiResponse } from '../types';

/**
 * Cliente de API base.
 * Encapsula el fetch y maneja el desempaquetado de la respuesta estandarizada.
 */
export const apiClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Si la URL empieza con '/', usamos el proxy de Vite en dev
    const baseUrl = env.VITE_API_URL || '';
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
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
};
