import { Calendar, Info, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuickPlannerProps {
  currentVelocity: number; // Materias por cuatrimestre histórica
  remainingSubjects: number;
}

export const QuickPlanner = ({ currentVelocity, remainingSubjects }: QuickPlannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Persistencia de la meta en localStorage
  const [targetYear, setTargetYear] = useState(() => 
    Number(localStorage.getItem('qp_target_year')) || new Date().getFullYear() + 2
  );
  const [targetMonth, setTargetMonth] = useState(() => 
    Number(localStorage.getItem('qp_target_month')) || 11 // Diciembre por defecto
  );

  useEffect(() => {
    localStorage.setItem('qp_target_year', targetYear.toString());
    localStorage.setItem('qp_target_month', targetMonth.toString());
  }, [targetYear, targetMonth]);

  const calculateNeededVelocity = () => {
    const today = new Date();
    const target = new Date(targetYear, targetMonth, 1);
    
    // Diferencia en meses
    const diffMonths = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    
    // Consideramos cuatrimestres (aprox 6 meses cada uno de "avance")
    // Si faltan 12 meses, son 2 cuatrimestres.
    const semesters = Math.max(1, Math.ceil(diffMonths / 6));
    
    const needed = remainingSubjects / semesters;
    return {
      semesters,
      needed: Number(needed.toFixed(1))
    };
  };

  const { semesters, needed } = calculateNeededVelocity();

  const getDifficulty = () => {
    if (needed <= 2.5) return { label: 'Relajado', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (needed <= 4.5) return { label: 'Recomendado', color: 'text-primary', bg: 'bg-primary/10' };
    if (needed <= 6.5) return { label: 'Esfuerzo Alto', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'Poco Probable', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const difficulty = getDifficulty();

  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);
  const months = [
    { value: 6, label: 'Julio (1° Cuat)' },
    { value: 11, label: 'Diciembre (2° Cuat)' }
  ];

  return (
    <div className="bg-card border border-foreground/5 rounded-3xl p-6 flex flex-col gap-6 transition-all duration-300 shadow-sm relative overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

      <div className="flex justify-between items-center relative z-10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Sparkles size={14} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
              Meta de Graduación
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tracking-tight">
              {targetMonth === 6 ? 'Julio' : 'Diciembre'} {targetYear}
            </span>
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${difficulty.bg} ${difficulty.color}`}>
              {difficulty.label}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-3 rounded-2xl transition-all ${isExpanded ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10'}`}
        >
          <Calendar size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Ritmo Necesario</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-primary">{needed}</span>
            <span className="text-[10px] font-bold text-foreground/40 leading-none">materias /<br/>cuatrimestre</span>
          </div>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Tiempo Restante</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-foreground/80">{semesters}</span>
            <span className="text-[10px] font-bold text-foreground/40 leading-none">cuatrimestres<br/>finales</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-5 pt-2 animate-in fade-in slide-in-from-top-2 relative z-10">
          <div className="h-px bg-foreground/5" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Año de Finalización</label>
              <select 
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="!bg-background border border-foreground/5 rounded-xl p-3 text-xs font-bold text-foreground/80 focus:ring-1 ring-primary outline-none transition-all cursor-pointer appearance-none"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-card">{y}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Periodo de Cierre</label>
              <select 
                value={targetMonth}
                onChange={(e) => setTargetMonth(Number(e.target.value))}
                className="!bg-background border border-foreground/5 rounded-xl p-3 text-xs font-bold text-foreground/80 focus:ring-1 ring-primary outline-none transition-all cursor-pointer appearance-none"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value} className="bg-card">{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <div className="p-2 bg-primary/10 rounded-xl text-primary mt-0.5">
              <TrendingUp size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-bold text-foreground/80">Tu velocidad actual es de {currentVelocity} materias/cuatri.</p>
              <p className="text-[10px] text-foreground/50 leading-relaxed">
                {needed > currentVelocity 
                  ? `Para recibirte en la fecha elegida necesitas aumentar tu ritmo un ${Math.round((needed/currentVelocity - 1) * 100)}%.`
                  : `Vas por buen camino. Manteniendo tu ritmo actual podrías incluso terminar antes de lo previsto.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="text-center text-[10px] font-black uppercase tracking-tighter text-foreground/20 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
        >
          <Info size={12} /> Toca para ajustar tu meta de graduación
        </button>
      )}
    </div>
  );
};
