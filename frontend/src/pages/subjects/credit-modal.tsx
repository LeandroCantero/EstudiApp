import { CreateCreditDto, Credit } from '@/entities/credit/model/types';
import { Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: Credit[];
  addCredit: (dto: CreateCreditDto) => Promise<any>;
  deleteCredit: (id: string) => Promise<void>;
}

export const CreditModal = ({ isOpen, onClose, credits, addCredit, deleteCredit }: CreditModalProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCredit, setNewCredit] = useState<CreateCreditDto>({
    category: 'Formación',
    activity: '',
    credits: 1,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCredit(newCredit);
      setNewCredit({ category: 'Formación', activity: '', credits: 1 });
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding credit:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-foreground/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Gestionar Créditos</h2>
          <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto flex flex-col gap-4">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Registrar Nueva Actividad
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-foreground/5 rounded-2xl p-4 flex flex-col gap-3 border border-primary/20">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Categoría</label>
                <select 
                  className="bg-card border-none rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newCredit.category}
                  onChange={e => setNewCredit(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option>Formación</option>
                  <option>Investigación</option>
                  <option>Extensión</option>
                  <option>Otros</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Actividad / Descripción</label>
                <input 
                  type="text" 
                  placeholder="Ej: Curso de React Avanzado"
                  className="bg-card border-none rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newCredit.activity}
                  onChange={e => setNewCredit(prev => ({ ...prev, activity: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Créditos</label>
                <input 
                  type="number" 
                  min="1"
                  max="35"
                  className="bg-card border-none rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none font-bold"
                  value={newCredit.credits}
                  onChange={e => setNewCredit(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-sm font-bold text-foreground/40"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-[10px] font-black uppercase text-foreground/30 tracking-widest ml-1">Historial de Créditos</h3>
            {credits.length === 0 ? (
              <p className="text-center py-8 text-xs text-foreground/30">No hay créditos registrados</p>
            ) : (
              credits.map(credit => (
                <div key={credit.id} className="bg-card border border-foreground/5 rounded-2xl p-4 flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase">{credit.category}</span>
                    <span className="text-sm font-semibold">{credit.activity}</span>
                    <span className="text-[10px] text-foreground/30">{new Date(credit.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-primary">+{credit.credits}</span>
                    <button 
                      onClick={() => deleteCredit(credit.id)}
                      className="p-2 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
