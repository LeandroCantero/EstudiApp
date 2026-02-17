import { useSubjects } from '@/entities/subject/model/use-subjects';
import { OnboardingPage } from '@/pages/onboarding/onboarding-page';
import { SubjectsPage } from '@/pages/subjects/subjects-page';
import { Sidebar } from '@/widgets/navigation/sidebar';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/dashboard-page';

export const App = () => {
  const { user, isLoading, refreshData } = useSubjects();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center p-6 text-primary">Cargando...</div>;
  }

  // Si no tiene carrera, forzamos onboarding (US-07)
  if (!user?.career) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage onFinish={refreshData} />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 px-6 pt-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/materias" element={<SubjectsPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};
