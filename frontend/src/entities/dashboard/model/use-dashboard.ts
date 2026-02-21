import { apiClient } from '@/shared/api/base';
import { useEffect, useState } from 'react';

export interface DashboardData {
  userName: string;
  careerName: string;
  totalSubjects: number;
  approvedSubjects: number;
  regularizedSubjects: number;
  progressPercentage: number;
  averageGrade: number;
  totalCredits: number;
  estimatedGraduationDate: string;
  remainingSubjects: number;
}

export interface Recommendation {
  id: string;
  priorityScore: number;
  unlocksCount: number;
  careerSubject: {
    id: string;
    code: string;
    subject: {
      name: string;
    };
  };
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          setError('No se encontró usuario');
          return;
        }

        const [dashboardData, recommendationsData] = await Promise.all([
          apiClient.get<DashboardData>('/users/dashboard'),
          apiClient.get<Recommendation[]>('/recommendations'),
        ]);

        setData(dashboardData);
        setRecommendations(recommendationsData);
      } catch (err) {
        setError('Error al cargar el dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, recommendations, isLoading, error };
};
