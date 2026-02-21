import { CheckCircle2, GraduationCap, TrendingUp, Calendar, Award } from 'lucide-react';
import { useDashboard } from '@/entities/dashboard/model/use-dashboard';

export const DashboardPage = () => {
  const { data, recommendations, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {data?.userName?.split(' ')[0] || 'Estudiante'} 👋
        </h1>
        <div className="flex items-center gap-2 text-primary font-medium">
          <GraduationCap size={18} />
          <span className="text-sm">{data?.careerName || 'Carrera no seleccionada'}</span>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-600 text-sm rounded-xl">
          Error cargando métricas: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<TrendingUp size={24} className="text-primary" />} 
          label="Promedio" 
          value={data?.averageGrade?.toFixed(2) || '0.00'} 
        />
        <StatCard 
          icon={<GraduationCap size={24} className="text-primary" />} 
          label="Avance" 
          value={`${data?.progressPercentage || 0}%`} 
        />
        <StatCard 
          icon={<Award size={24} className="text-primary" />} 
          label="Créditos" 
          value={`${data?.totalCredits || 0}`} 
        />
        <StatCard 
          icon={<CheckCircle2 size={24} className="text-primary" />} 
          label="Aprobadas" 
          value={`${data?.approvedSubjects || 0}`} 
        />
      </div>

      <div className="bg-primary/10 rounded-2xl p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Fecha Estimada de Graduación
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {data?.estimatedGraduationDate 
              ? new Date(data.estimatedGraduationDate).toLocaleDateString('es-AR', { 
                  year: 'numeric', 
                  month: 'long' 
                })
              : 'Calculando...'}
          </span>
        </div>
        <p className="text-xs text-foreground/70">
          {data?.remainingSubjects || 0} materias pendientes
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Sugerencias de Cursada</h2>
        <div className="flex flex-col gap-3">
          {recommendations.length > 0 ? (
            recommendations.slice(0, 5).map((rec) => (
              <SubjectSuggestion 
                key={rec.careerSubject.id} 
                code={rec.careerSubject.code}
                name={rec.careerSubject.subject.name} 
                reason={`Desbloquea ${rec.unlocksCount} materias`}
              />
            ))
          ) : (
            <div className="p-4 bg-card/50 text-foreground/60 text-sm rounded-xl text-center">
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

const SubjectSuggestion = ({ code, name, reason }: { code: string; name: string; reason: string }) => (
  <div className="bg-card rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
      <CheckCircle2 size={20} className="text-primary" />
    </div>
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{code}</span>
        <span className="font-medium text-sm">{name}</span>
      </div>
      <span className="text-xs text-foreground/60">{reason}</span>
    </div>
  </div>
);
