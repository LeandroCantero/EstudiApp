import { useCalendar } from '@/entities/calendar/model/use-calendar';
import { useCredits } from '@/entities/credit/model/use-credits';
import { useDashboard } from '@/entities/dashboard/model/use-dashboard';
import { Award, CheckCircle2, GraduationCap, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { CreditModal } from '../subjects/credit-modal';
import { AcademicTimeline } from './academic-timeline';
import { AlertsPanel } from './alerts-panel';
import { MetricModal } from './metric-modal';
import { QuickPlanner } from './quick-planner';

export const DashboardPage = () => {
  const { data, recommendations, alerts, isLoading: isLoadingDashboard, error } = useDashboard();
  const { events, isLoading: isLoadingCalendar } = useCalendar();
  const { credits, totalCredits, addCredit, deleteCredit, isLoading: isLoadingCredits } = useCredits();
  
  const isLoading = isLoadingDashboard || isLoadingCalendar || isLoadingCredits;

  const [activeModal, setActiveModal] = useState<'average' | 'progress' | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [plannedSubjects, setPlannedSubjects] = useState<string[]>([]);

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

      <AlertsPanel alerts={alerts} />

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
          onClick={() => setActiveModal('average')}
        />
        <StatCard 
          icon={<GraduationCap size={24} className="text-primary" />} 
          label="Avance" 
          value={`${data?.progressPercentage || 0}%`} 
          onClick={() => setActiveModal('progress')}
        />
        <StatCard 
          icon={<Award size={24} className="text-primary" />} 
          label="Créditos" 
          value={`${totalCredits || 0}`} 
          onClick={() => setIsCreditModalOpen(true)}
          highlight
        />
        <StatCard 
          icon={<CheckCircle2 size={24} className="text-primary" />} 
          label="Aprobadas" 
          value={`${data?.approvedSubjects || 0}`} 
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <QuickPlanner 
            currentVelocity={data?.averageVelocity || 0}
            remainingSubjects={(data?.remainingSubjects || 0) - plannedSubjects.length}
            onPlanChange={(plan) => console.log('Nuevo plan:', plan)}
          />

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Sugerencias de Cursada</h2>
            <div className="flex flex-col gap-3">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 5).map((rec) => (
                  <SubjectSuggestion 
                    key={rec.careerSubject.id} 
                    code={rec.careerSubject.code}
                    name={rec.careerSubject.subject.name} 
                    impact={rec.transitiveImpact}
                    isSeason={rec.matchesSeason}
                    hours={rec.hours}
                    isPlanned={plannedSubjects.includes(rec.careerSubject.id)}
                    onPlan={() => {
                      if (plannedSubjects.includes(rec.careerSubject.id)) {
                        setPlannedSubjects(plannedSubjects.filter(id => id !== rec.careerSubject.id));
                      } else {
                        setPlannedSubjects([...plannedSubjects, rec.careerSubject.id]);
                      }
                    }}
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

        <div className="flex flex-col gap-8">
          <AcademicTimeline events={events} />
        </div>
      </div>

      <MetricModal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)}
        type={activeModal || 'average'}
        data={activeModal === 'average' ? {
          value: data?.averageGrade?.toFixed(2),
          breakdown: data?.gradeBreakdown
        } : {
          approved: data?.approvedSubjects,
          regularized: data?.regularizedSubjects,
          progress: data?.progressPercentage,
          remaining: data?.remainingSubjects,
          credits: data?.totalCredits
        }}
      />

      <CreditModal 
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        credits={credits}
        addCredit={addCredit}
        deleteCredit={deleteCredit}
      />
    </div>
  );
};


const StatCard = ({ icon, label, value, onClick, highlight }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  onClick?: () => void;
  highlight?: boolean;
}) => (
  <div 
    onClick={onClick}
    className={`bg-card rounded-2xl p-4 flex flex-col gap-2 shadow-sm transition-all border ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/20 bg-background/50' : 'border-transparent'} ${highlight ? 'border-primary/20 ring-1 ring-primary/5' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="p-2 bg-background rounded-lg">{icon}</div>
      {onClick && <TrendingUp size={12} className="text-primary/20" />}
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-primary">{value}</span>
      <span className="text-xs text-foreground/60">{label}</span>
    </div>
  </div>
);


const SubjectSuggestion = ({ 
  code, 
  name, 
  impact, 
  isSeason, 
  hours,
  isPlanned,
  onPlan
}: { 
  code: string; 
  name: string; 
  impact: number; 
  isSeason: boolean; 
  hours: number;
  isPlanned: boolean;
  onPlan: () => void;
}) => (
  <div className={`bg-card rounded-xl p-4 flex items-center gap-4 border relative overflow-hidden group transition-all ${isPlanned ? 'border-primary shadow-sm bg-primary/5' : 'border-foreground/5'}`}>
    {isSeason && !isPlanned && (
      <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
        Ideal para este cuatrimestre
      </div>
    )}
    {isPlanned && (
      <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
        Planificada
      </div>
    )}
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isPlanned ? 'bg-primary text-primary-foreground scale-110' : 'bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground'}`}>
      <CheckCircle2 size={20} />
    </div>
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${isPlanned ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>{code}</span>
        <span className="font-semibold text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-foreground/40 font-medium">Impacto total: <b className="text-foreground/60">{impact} materias</b></span>
        <span className="text-[10px] text-foreground/40 font-medium">Carga: <b className="text-foreground/60">{hours}hs</b></span>
      </div>
    </div>
    <button 
      onClick={onPlan}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isPlanned ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-sm shadow-primary/20'}`}
    >
      {isPlanned ? 'QUITAR' : 'PLANIFICAR'}
    </button>
  </div>
);

