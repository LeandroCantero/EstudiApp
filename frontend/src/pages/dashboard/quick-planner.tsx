import { Calendar, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';

interface QuickPlannerProps {
  currentVelocity: number;
  remainingSubjects: number;
  onPlanChange: (plan: number[]) => void;
}

export const QuickPlanner = ({ currentVelocity, remainingSubjects, onPlanChange }: QuickPlannerProps) => {
  const [plan, setPlan] = useState<number[]>([currentVelocity, currentVelocity, currentVelocity, currentVelocity]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleValueChange = (index: number, value: number) => {
    const newPlan = [...plan];
    newPlan[index] = Math.max(0, Math.min(8, value));
    setPlan(newPlan);
    onPlanChange(newPlan);
  };

  const calculateNewDate = () => {
    let totalPlanned = 0;
    let semesters = 0;
    
    // Usamos el plan específico para los primeros 4 cuatrimestres
    for (let i = 0; i < plan.length; i++) {
        totalPlanned += plan[i];
        semesters++;
        if (totalPlanned >= remainingSubjects) return semesters;
    }

    // Si sobran materias, usamos el promedio del plan
    const remainingAfterPlan = remainingSubjects - totalPlanned;
    if (remainingAfterPlan > 0) {
        const avgAfter = plan.reduce((a, b) => a + b, 0) / plan.length || 1;
        semesters += Math.ceil(remainingAfterPlan / avgAfter);
    }

    return semesters;
  };

  const semestersToGrad = calculateNewDate();
  const gradDate = new Date();
  gradDate.setMonth(gradDate.getMonth() + (semestersToGrad * 6));

  return (
    <div className="bg-primary/10 rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 shadow-sm border border-primary/5">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
              Proyección de Título
            </span>
          </div>
          <span className="text-3xl font-black text-primary tracking-tight">
            {gradDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
          </span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-primary text-primary-foreground rotate-90' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isExpanded ? (
        <div className="flex flex-col gap-5 pt-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
               <Info size={12} /> Materias por Cuatrimestre
            </p>
            <div className="grid grid-cols-4 gap-3">
              {plan.map((val, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="bg-card/50 rounded-2xl p-3 flex flex-col items-center gap-1 border border-primary/5 group hover:border-primary/20 transition-all">
                    <span className="text-[9px] font-black text-foreground/30 uppercase">C{i+1}</span>
                    <input 
                      type="number" 
                      value={val}
                      onChange={(e) => handleValueChange(i, parseInt(e.target.value) || 0)}
                      className="w-full text-center bg-transparent border-none font-black text-primary text-xl focus:ring-0 p-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-primary/20 p-3 rounded-2xl border border-primary/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary/60 uppercase">Estado Final</span>
              <span className="text-sm font-black text-primary">{semestersToGrad} cuatrimestres restantes</span>
            </div>
            <div className="text-right">
                <span className="text-[10px] font-bold text-primary/60 uppercase">Pendientes</span>
                <p className="text-sm font-black text-primary">{remainingSubjects}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-primary/40">
           <span>Plan Granular Inactivo</span>
           <span className="flex items-center gap-1"><Info size={10} /> Toca para ajustar ritmo</span>
        </div>
      )}
    </div>
  );
};
