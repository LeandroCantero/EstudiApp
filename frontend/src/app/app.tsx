import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { SubjectsPage } from '@/pages/subjects/subjects-page';
import { OnboardingPage } from '@/pages/onboarding/onboarding-page';
import { CalendarPage } from '@/pages/calendar/calendar-page';
import { ResourcesPage } from '@/pages/resources/resources-page';
import { SubjectDetailPage } from '@/pages/subject-detail/subject-detail-page';
import { Sidebar } from '@/widgets/navigation/sidebar';

export const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const authRoutes = (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  const mainRoutes = (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 px-6 pt-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/materias" element={<SubjectsPage />} />
          <Route path="/materias/:id" element={<SubjectDetailPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/recursos" element={<ResourcesPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );

  return isAuthenticated ? mainRoutes : authRoutes;
};
