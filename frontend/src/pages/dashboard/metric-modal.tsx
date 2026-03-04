import { GraduationCap, TrendingUp, X } from 'lucide-react';

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'average' | 'progress';
  data: any;
}

export const MetricModal = ({ isOpen, onClose, type, data }: MetricModalProps) => {
  if (!isOpen) return null;

  const isAverage = type === 'average';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <div className="p-6 border-b flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              {isAverage ? <TrendingUp size={20} /> : <GraduationCap size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isAverage ? 'Detalle de Promedio' : 'Desglose de Avance'}
              </h2>
              <p className="text-xs text-foreground/50 font-medium">
                {isAverage ? 'Basado en finales y cursadas cerradas' : 'Estado actual de tu carrera'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-foreground/5 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isAverage ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-baseline bg-primary/10 p-4 rounded-2xl">
                <span className="text-sm font-bold text-primary/60 uppercase">Promedio Actual</span>
                <span className="text-4xl font-black text-primary">{data.value}</span>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-1">Materias Computadas</h3>
                {data.breakdown?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-foreground/5 bg-card/50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{item.name}</span>
                      <span className="text-[10px] text-foreground/40 font-mono uppercase">{item.code}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-primary">{item.grade}</span>
                      <span className="text-[8px] font-black uppercase text-foreground/30">{item.status}</span>
                    </div>
                  </div>
                ))}
                {(!data.breakdown || data.breakdown.length === 0) && (
                  <p className="text-sm text-foreground/40 text-center py-8">No hay materias con nota registrada aún.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Grilla de Cuadrados */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  label="Aprobadas" 
                  value={data.approved} 
                  colorClass="bg-primary/10 text-primary border-primary/5" 
                  subLabel="Finales metidos"
                />
                <StatCard 
                  label="Regularizadas" 
                  value={data.regularized} 
                  colorClass="bg-orange-500/10 text-orange-600 border-orange-500/5" 
                  subLabel="Cursadas cerradas"
                />
                <StatCard 
                  label="Pendientes" 
                  value={data.remaining} 
                  colorClass="bg-foreground/5 text-foreground/70 border-foreground/5" 
                  subLabel="Por cursar o rendir"
                />
                <StatCard 
                  label="Créditos" 
                  value={data.credits} 
                  colorClass="bg-blue-500/10 text-blue-600 border-blue-500/5" 
                  subLabel="Actividades extra"
                />
              </div>

              {/* Barra de Progreso Destacada al Final */}
              <div className="mt-2 p-5 bg-card border rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Progreso General</span>
                    <span className="text-sm font-bold text-foreground/60">{data.approved} de {data.totalSubjects} materias</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-primary leading-none">{data.progress}%</span>
                  </div>
                </div>
                
                <div className="w-full h-4 bg-primary/5 rounded-full overflow-hidden border border-primary/10 relative">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                    style={{ width: `${data.progress}%` }}
                  />
                  {/* Glass effect on the bar */}
                  <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                </div>

                <p className="text-[10px] text-center text-foreground/40 font-medium italic">
                  * Las materias regularizadas cuentan al 50% para el progreso total.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, colorClass, subLabel }: { 
  label: string; 
  value: string | number; 
  colorClass: string;
  subLabel?: string;
}) => (
  <div className={`${colorClass} border p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all hover:scale-[1.02] hover:shadow-lg`}>
    <span className="text-[10px] font-black uppercase tracking-tight opacity-70 mb-1 leading-none">{label}</span>
    <span className="text-3xl font-black">{value}</span>
    {subLabel && <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter mt-1">{subLabel}</span>}
  </div>
);
