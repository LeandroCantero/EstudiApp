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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-5 rounded-2xl flex flex-col gap-1 items-center">
                  <span className="text-xs font-black text-primary/60 uppercase">Aprobadas</span>
                  <span className="text-3xl font-black text-primary">{data.approved}</span>
                </div>
                <div className="bg-orange-500/10 p-5 rounded-2xl flex flex-col gap-1 items-center">
                  <span className="text-xs font-black text-orange-600/60 uppercase">Regularizadas</span>
                  <span className="text-3xl font-black text-orange-600">{data.regularized}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-1">Estadísticas de Carrera</h3>
                <div className="space-y-3">
                  <StatRow label="Progreso Total" value={`${data.progress}%`} barColor="bg-primary" />
                  <StatRow label="Materias Pendientes" value={data.remaining} barColor="bg-foreground/10" />
                  <StatRow label="Créditos Acumulados" value={data.credits} barColor="bg-blue-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, barColor }: { label: string; value: string | number; barColor: string }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-foreground/60">{label}</span>
      <span>{value}</span>
    </div>
    <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
      <div className={`h-full ${barColor}`} style={{ width: typeof value === 'string' && value.includes('%') ? value : '100%' }}></div>
    </div>
  </div>
);
