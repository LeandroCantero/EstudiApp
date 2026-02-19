
import { CheckCircle2, GraduationCap, TrendingUp } from 'lucide-react';
import { useSubjects } from '../../entities/subject/model/use-subjects';

export const DashboardPage = () => {
  const { user, metrics, suggestions, isLoading, error } = useSubjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Hola, {user?.name?.split(' ')[0] || 'Estudiante'} 👋</h1>
        <div className="flex items-center gap-2 text-primary font-medium">
          <GraduationCap size={18} />
          <span className="text-sm">{user?.career?.name || 'Carrera no seleccionada'}</span>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl">
          Error cargando métricas: {error}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<GraduationCap className="text-primary" />} 
          label="Promedio" 
          value={metrics?.average.toString() || '0.00'} 
        />
        <StatCard 
          icon={<TrendingUp className="text-primary" />} 
          label="Avance" 
          value={`${metrics?.progress || 0}%`} 
        />
      </div>

      {/* Graduation Projection */}
      <div className="bg-primary/10 rounded-2xl p-5 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Fecha Estimada de Graduación</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">Diciembre 2026</span>
        </div>
        <p className="text-xs text-foreground/70">Basado en tu ritmo de 4 materias por cuatrimestre.</p>
      </div>

      {/* Suggested Subjects (Real Data) */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Sugerencias de Cursada</h2>
        <div className="flex flex-col gap-3">
          {suggestions.length > 0 ? (
            suggestions.map((subject) => (
              <SubjectSuggestion 
                key={subject.code} 
                name={subject.name} 
                reason={subject.reason || 'Correlativas al día'} 
              />
            ))
          ) : (
             <div className="p-4 bg-muted/20 text-muted-foreground text-sm rounded-xl">
               No hay sugerencias disponibles por el momento. 🎉
             </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
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
  <div className="bg-card rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      <CheckCircle2 size={20} className="text-primary" />
    </div>
    <div className="flex flex-col">
      <span className="font-medium text-sm">{name}</span>
      <span className="text-xs text-foreground/60">{reason}</span>
    </div>
  </div>
);
