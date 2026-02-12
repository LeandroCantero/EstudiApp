
import { CheckCircle2, GraduationCap, TrendingUp } from 'lucide-react';

export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Hola, Leandro 👋</h1>
        <p className="text-foreground/60 text-sm">Este es tu progreso académico actual.</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<GraduationCap className="text-primary" />} 
          label="Promedio" 
          value="8.42" 
        />
        <StatCard 
          icon={<TrendingUp className="text-primary" />} 
          label="Avance" 
          value="45%" 
        />
      </div>

      {/* Graduation Projection */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Fecha Estimada de Graduación</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">Diciembre 2026</span>
        </div>
        <p className="text-xs text-foreground/70">Basado en tu ritmo de 4 materias por cuatrimestre.</p>
      </div>

      {/* Suggested Subjects (Placeholder/RN5) */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Sugerencias de Cursada</h2>
        <div className="flex flex-col gap-3">
          <SubjectSuggestion name="Ingeniería de Software" reason="Desbloquea 3 materias" />
          <SubjectSuggestion name="Base de Datos II" reason="Prioridad Alta (Correlatividad)" />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-background rounded-lg">{icon}</div>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-foreground/60">{label}</span>
    </div>
  </div>
);

const SubjectSuggestion = ({ name, reason }: { name: string; reason: string }) => (
  <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      <CheckCircle2 size={20} className="text-primary" />
    </div>
    <div className="flex flex-col">
      <span className="font-medium text-sm">{name}</span>
      <span className="text-xs text-foreground/60">{reason}</span>
    </div>
  </div>
);
