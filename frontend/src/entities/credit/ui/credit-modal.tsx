import { Award, X } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_LIST } from '../model/constants';
import { CreateCreditDto } from '../model/types';

export const CreditModal = ({ isOpen, onClose, onAdd, isLoading }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dto: CreateCreditDto) => Promise<any>;
  isLoading?: boolean;
}) => {
  const [formData, setFormData] = useState<CreateCreditDto>({
    category: CATEGORY_LIST[0],
    activity: '',
    credits: 1,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAdd(formData);
      setFormData({ category: CATEGORY_LIST[0], activity: '', credits: 1 });
      onClose();
    } catch (err) {
      console.error('Error adding credit:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card border w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-3 text-primary">
            <Award size={22} className="drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            <h2 className="text-base font-black uppercase tracking-[0.1em]">Nueva Actividad</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-foreground/5 rounded-2xl transition-all hover:rotate-90"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="md:col-span-3 flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Categoría</label>
                 <select 
                   className="w-full bg-[#141414] border border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-primary outline-none appearance-none cursor-pointer text-foreground hover:bg-[#1a1a1a] transition-all"
                   value={formData.category}
                   onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                 >
                   {CATEGORY_LIST.map(cat => (
                     <option key={cat} value={cat} className="bg-[#141414] text-foreground">{cat}</option>
                   ))}
                 </select>
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Créditos</label>
                 <input 
                   type="number" 
                   min="1"
                   className="w-full bg-[#141414] border border-white/5 rounded-2xl p-4 text-sm font-black focus:ring-2 ring-primary outline-none text-foreground text-center"
                   value={formData.credits}
                   onChange={e => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                 />
               </div>
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-2">Descripción / Actividad</label>
               <input 
                 type="text" 
                 placeholder="Ej: Curso de React Avanzado"
                 className="w-full bg-[#141414] border border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-primary outline-none text-foreground placeholder:text-foreground/20"
                 value={formData.activity}
                 required
                 onChange={e => setFormData(prev => ({ ...prev, activity: e.target.value }))}
               />
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-2">
               <button 
                 type="button"
                 onClick={onClose}
                 className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] text-foreground/30 hover:text-foreground transition-all"
               >
                 Volver
               </button>
               <button 
                 type="submit"
                 disabled={isLoading}
                 className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
               >
                 {isLoading ? 'Cargando...' : 'Confirmar Carga'}
               </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};

