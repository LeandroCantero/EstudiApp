import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/dashboard-page';
import { MainLayout } from './layout';

export const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="materias" element={<div>Materias (Próximamente)</div>} />
        <Route path="calendario" element={<div>Calendario (Próximamente)</div>} />
        <Route path="recursos" element={<div>Recursos (Próximamente)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
