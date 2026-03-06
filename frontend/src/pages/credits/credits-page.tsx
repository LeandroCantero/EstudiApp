import { CREDIT_CATEGORIES, CREDIT_LIMITS } from '@/entities/credit/model/constants';
import { Credit } from '@/entities/credit/model/types';
import { useCredits } from '@/entities/credit/model/use-credits';
import { CreditModal } from '@/entities/credit/ui/credit-modal';
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Info, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { 
    label: CREDIT_CATEGORIES.CR1_033, 
    key: CREDIT_CATEGORIES.CR1_033, 
    max: CREDIT_LIMITS.CR1_033, 
    icon: <Award size={16} /> 
  },
  { 
    label: CREDIT_CATEGORIES.CR2_ITI, 
    key: CREDIT_CATEGORIES.CR2_ITI, 
    max: CREDIT_LIMITS.CR2_ITI, 
    icon: <Info size={16} /> 
  },
  { 
    label: CREDIT_CATEGORIES.CR3_ITI, 
    key: CREDIT_CATEGORIES.CR3_ITI, 
    max: CREDIT_LIMITS.CR3_ITI, 
    icon: <Plus size={16} /> 
  },
  { 
    label: CREDIT_CATEGORIES.CR4_ITI, 
    key: CREDIT_CATEGORIES.CR4_ITI, 
    max: CREDIT_LIMITS.CR4_ITI, 
    icon: <ChevronRight size={16} /> 
  },
];

const TOTAL_REQUIRED = 40;

export const CreditsPage = () => {
  const navigate = useNavigate();
  const { credits, totalCredits, isLoading, addCredit, deleteCredit } = useCredits();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryCount = (key: string) => {
    return credits
      .filter((c: Credit) => c.category === key)
      .reduce((sum: number, c: Credit) => sum + c.credits, 0);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 hover:bg-foreground/5 rounded-2xl transition-all text-foreground/40 hover:text-primary active:scale-95"
            title="Volver al Inicio"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3 text-primary">
            <Award size={32} className="drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            <h1 className="text-3xl font-black tracking-tight uppercase">Gestión de Créditos</h1>
          </div>
        </div>
        <p className="text-foreground/50 text-base font-medium max-w-2xl">
          Seguimiento de actividades extracurriculares obligatorias para la graduación.
        </p>
      </header>

      {/* Main Progress Banner */}
      <div className="relative overflow-hidden bg-card border border-primary/20 rounded-[40px] p-8 shadow-2xl shadow-primary/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2">Progreso Total de Créditos</span>
            <div className="flex items-baseline gap-3">
              <h2 className="text-6xl font-black tabular-nums">{totalCredits}</h2>
              <span className="text-xl font-bold text-foreground/30">/ {TOTAL_REQUIRED} puntos</span>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full flex flex-col gap-3">
            <div className="h-4 bg-foreground/5 rounded-full overflow-hidden p-1 shadow-inner">
               <div 
                 className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                 style={{ width: `${Math.min((totalCredits / TOTAL_REQUIRED) * 100, 100)}%` }}
               />
            </div>
            <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                 {Math.round((totalCredits / TOTAL_REQUIRED) * 100)}% Completado
               </span>
               {totalCredits >= TOTAL_REQUIRED && (
                 <span className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">
                   <CheckCircle2 size={12} /> Requisito Cumplido
                 </span>
               )}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={16} /> Cargar Actividad
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Categories Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 px-2">Desglose por Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat.key);
              const isCompleted = count >= cat.max;
              return (
                <div 
                  key={cat.key} 
                  className={`bg-card border rounded-[32px] p-6 transition-all hover:scale-[1.02] ${
                    isCompleted ? 'border-green-500/30' : 'border-foreground/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-primary/5 text-primary'}`}>
                      {cat.icon}
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={`text-2xl font-black tabular-nums ${isCompleted ? 'text-green-500' : 'text-foreground'}`}>
                          {count}
                        </span>
                        <span className="text-xs font-bold text-foreground/20">/ {cat.max}</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 leading-none mt-1">puntos</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm mb-3 pr-8 leading-tight">{cat.label}</h4>
                  <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min((count / cat.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History Sidebar */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 px-2">Historial</h3>
          <div className="flex flex-col gap-2">
            {credits.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-foreground/5 rounded-[32px] flex flex-col items-center justify-center text-foreground/20 italic text-xs">
                Sin registros cargados
              </div>
            ) : (
              credits.map((credit: Credit) => (
                <div key={credit.id} className="bg-card border border-foreground/5 rounded-2xl p-4 flex items-center gap-3 group transition-all hover:border-primary/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex flex-shrink-0 items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Award size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary truncate mb-0.5">{credit.category}</p>
                    <h5 className="text-[11px] font-bold truncate leading-tight transition-colors group-hover:text-primary">{credit.activity}</h5>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black tabular-nums">{credit.credits}</span>
                    <button 
                      onClick={() => deleteCredit(credit.id)}
                      className="p-1 text-foreground/10 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <CreditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addCredit}
        isLoading={isLoading}
      />
    </div>
  );
};
