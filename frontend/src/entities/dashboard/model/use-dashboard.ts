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
  averageVelocity: number;
  gradeBreakdown: {
    id: string;
    name: string;
    code: string;
    grade: number;
    status: string;
  }[];
}


export interface Recommendation {
  id: string;
  priorityScore: number;
  transitiveImpact: number;
  matchesSeason: boolean;
  hours: number;
  careerSubject: {
    id: string;
    code: string;
    subject: {
      name: string;
    };
  };
}

export interface DashboardAlert {
  id: string;
  type: 'CORRELATIVE_BLOCK' | 'REGULARITY_EXPIRY';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  subjectId: string;
  subjectName: string;
  message: string;
  metadata: any;
}


export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
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

        const [dashboardData, recommendationsData, alertsData] = await Promise.all([
          apiClient.get<DashboardData>('/users/dashboard'),
          apiClient.get<Recommendation[]>('/recommendations'),
          apiClient.get<DashboardAlert[]>('/my-subjects/alerts'),
        ]);

        setData(dashboardData);
        setRecommendations(recommendationsData);
        setAlerts(alertsData);
      } catch (err) {
        setError('Error al cargar el dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }

    };

    fetchDashboard();
  }, []);

  return { data, recommendations, alerts, isLoading, error };

};
