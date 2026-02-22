import { apiClient } from '@/shared/api/base';
import { CreateCreditDto, Credit } from '../model/types';

export const creditApi = {
  getCredits: (): Promise<Credit[]> => {
    return apiClient.get<Credit[]>('/credits');
  },

  createCredit: (data: CreateCreditDto): Promise<Credit> => {
    return apiClient.post<Credit>('/credits', data);
  },

  deleteCredit: (id: string): Promise<void> => {
    return apiClient.delete(`/credits/${id}`);
  }
};
