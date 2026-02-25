import { CreateCreditDto, Credit } from '@/entities/credit/model/types';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: Credit[];
  addCredit: (dto: CreateCreditDto) => Promise<any>;
  deleteCredit: (id: string) => Promise<void>;
}

const CREDIT_CATEGORIES = [
  'CR1_033: Espacio de Integración Curricular / Proyecto de software',
  'CR2_ITI: Actividades formativas académicas y profesionales',
  'CR3_ITI: Actividades sociales, culturales y deportivas',
  'CR4_ITI: Actividades formativas en docencia e investigación',
];

export const CreditModal = ({ isOpen, onClose, credits, addCredit, deleteCredit }: CreditModalProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCredit, setNewCredit] = useState<CreateCreditDto>({
    category: CREDIT_CATEGORIES[0],
    activity: '',
    credits: 1,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCredit(newCredit);
      setNewCredit({ category: CREDIT_CATEGORIES[0], activity: '', credits: 1 });
      setIsAdding(false);
      toast.success('Crédito registrado correctamente');
    } catch (err) {
      console.error('Error adding credit:', err);
      toast.error('Error al registrar el crédito');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCredit(id);
      toast.success('Crédito eliminado');
    } catch (err) {
      toast.error('Error al eliminar el crédito');
    }
  };

  const adjustCredits = (amount: number) => {
    setNewCredit(prev => ({
      ...prev,
      credits: Math.max(1, Math.min(35, prev.credits + amount))
    }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-card border border-foreground/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Gestionar Créditos</h2>
          <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-4">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(255,107,0,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Registrar Nueva Actividad
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Categoría</label>
                <select 
                  className="!bg-[#1a1a1a] border border-foreground/5 rounded-xl p-3.5 text-xs font-bold text-foreground/80 focus:ring-1 ring-primary outline-none transition-all cursor-pointer appearance-none"
                  value={newCredit.category}
                  onChange={e => setNewCredit(prev => ({ ...prev, category: e.target.value }))}
                >
                  {CREDIT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a] text-foreground/80">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Actividad / Descripción</label>
                <input 
                  type="text" 
                  placeholder="Ej: Análisis de Datos en Python"
                  className="!bg-[#1a1a1a] border border-foreground/5 rounded-xl p-3.5 text-sm text-foreground focus:ring-1 ring-primary outline-none transition-all placeholder:text-foreground/10"
                  value={newCredit.activity}
                  onChange={e => setNewCredit(prev => ({ ...prev, activity: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4 mt-2 bg-foreground/[0.02] rounded-2xl p-4 border border-foreground/5">
                <label className="text-[10px] font-black uppercase text-foreground/40">Carga de Créditos</label>
                <div className="flex items-center gap-2 !bg-[#1a1a1a] rounded-xl border border-foreground/10 p-1 pr-1.5 shadow-sm focus-within:ring-1 ring-primary-500/50 transition-all">
                  <input 
                    type="number" 
                    min="1"
                    max="35"
                    className="w-14 bg-transparent border-none p-2 text-center text-lg font-black text-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={newCredit.credits}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setNewCredit(prev => ({ ...prev, credits: Math.min(35, Math.max(0, val)) }));
                      } else if (e.target.value === '') {
                        setNewCredit(prev => ({ ...prev, credits: 0 }));
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 border-l border-foreground/10 pl-2">
                    <button 
                      type="button"
                      onClick={() => adjustCredits(-1)}
                      className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                      title="Restar"
                    >
                      <Minus size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => adjustCredits(1)}
                      className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                      title="Sumar"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-foreground/5 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 text-sm font-bold text-foreground/40 hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-black shadow-[0_8px_20px_-6px_rgba(255,107,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-[10px] font-black uppercase text-foreground/30 tracking-widest ml-1">Historial de Créditos</h3>
            {credits.length === 0 ? (
              <p className="text-center py-12 text-xs text-foreground/20 italic bg-foreground/[0.02] rounded-3xl border border-dashed border-foreground/5">No hay créditos registrados</p>
            ) : (
              credits.map(credit => (
                <div key={credit.id} className="bg-card border border-foreground/5 rounded-2xl p-4 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex flex-col flex-1 pr-4">
                    <span className="text-[10px] font-bold text-primary uppercase line-clamp-1 opacity-70">{credit.category.split(':')[0]}</span>
                    <span className="text-sm font-bold text-foreground/90">{credit.activity}</span>
                    <span className="text-[10px] font-medium text-foreground/30 mt-0.5">{new Date(credit.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-primary">+{credit.credits}</span>
                      <span className="text-[8px] font-black text-primary/40 uppercase tracking-tighter">PUNTOS</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(credit.id)}
                      className="p-2 text-foreground/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
