import { useCallback, useEffect, useState } from 'react';
import { creditApi } from '../api/credit-api';
import { CreateCreditDto, Credit } from './types';

export const useCredits = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await creditApi.getCredits();
      setCredits(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los créditos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCredit = async (dto: CreateCreditDto) => {
    setIsLoading(true);
    try {
      const newCredit = await creditApi.createCredit(dto);
      setCredits(prev => [newCredit, ...prev]);
      return newCredit;
    } catch (err: any) {
      throw new Error(err.message || 'Error al registrar el crédito');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCredit = async (id: string) => {
    try {
      await creditApi.deleteCredit(id);
      setCredits(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar el crédito');
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    totalCredits: credits.reduce((sum, c) => sum + c.credits, 0),
    isLoading,
    error,
    refresh: fetchCredits,
    addCredit,
    deleteCredit,
  };
};
