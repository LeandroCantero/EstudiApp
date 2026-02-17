import { User, userApi } from '@/entities/user/api/user-api';
import { useCallback, useEffect, useState } from 'react';
import { subjectApi } from '../api/subject-api';
import { AcademicMetrics, Subject } from './types';

// ID de usuario estático para el prototipo (debe coincidir con el seed o ser configurable)
const DEFAULT_USER_ID = 'admin-user-id'; // Reemplazar con lógica real luego

export const useSubjects = (userId: string = DEFAULT_USER_ID) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [metrics, setMetrics] = useState<AcademicMetrics | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primero obtenemos los datos del usuario actual para saber su ID de forma inteligente
      const userData = await userApi.getMe();
      const userId = userData.id;

      const [subjectsData, metricsData] = await Promise.all([
        subjectApi.getAll(userId),
        subjectApi.getMetrics(userId),
      ]);
      
      setSubjects(subjectsData);
      setMetrics(metricsData);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    subjects,
    metrics,
    user,
    isLoading,
    error,
    refreshData,
  };
};
