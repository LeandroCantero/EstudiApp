import { useCredits } from '@/entities/credit/model/use-credits';
import { Award, BookMarked, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Resource {
  id: string;
  category: string;
  title: string;
  url: string;
  description?: string;
}

export const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'personal' | 'credits'>('global');
  
  const { credits, isLoading: isLoadingCredits, addCredit, deleteCredit } = useCredits();
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  const [newCredit, setNewCredit] = useState({ category: 'Cursos', activity: '', credits: 1 });

  const globalResources: Resource[] = [
    {
      id: '1',
      category: 'UNAHUR',
      title: 'Página oficial UNAHUR',
      url: 'https://www.unahur.edu.ar',
      description: 'Universidad Nacional de Hurlingham',
    },
    {
      id: '2',
      category: 'Calendario',
      title: 'Calendario Académico',
      url: '#',
      description: 'Fechas importantes del cuatrimestre',
    },
    {
      id: '3',
      category: 'Biblioteca',
      title: 'Biblioteca Digital',
      url: '#',
      description: 'Acceso a recursos bibliográficos',
    },
  ];

  const personalResources: Resource[] = [
    {
      id: '4',
      category: 'Apuntes',
      title: 'Apuntes Matemática I',
      url: 'https://notion.so',
      description: 'Apuntes del primer cuatrimestre',
    },
  ];

  const resources = activeTab === 'global' ? globalResources : personalResources;

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCredit(newCredit);
      setNewCredit({ category: 'Cursos', activity: '', credits: 1 });
      setIsAddingCredit(false);
    } catch (err) {
      console.error('Error adding credit:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recursos</h1>
          <p className="text-foreground/60 text-sm">Links útiles y materiales</p>
        </div>
        {activeTab === 'credits' && !isAddingCredit && (
          <button 
            onClick={() => setIsAddingCredit(true)}
            className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20"
          >
            <Plus size={24} />
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-card rounded-xl">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'global'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Generales
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'personal'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Personales
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'credits'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          Créditos
        </button>
      </div>

      {/* Resources List (Global & Personal) */}
      {(activeTab === 'global' || activeTab === 'personal') && (
        <div className="flex flex-col gap-4">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookMarked size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary px-2 py-1 bg-primary/10 rounded-lg">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-sm text-foreground/60">{resource.description}</p>
                  )}
                </div>
                <ExternalLink size={20} className="text-foreground/40 flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Credits Tab */}
      {activeTab === 'credits' && (
        <div className="flex flex-col gap-4">
          {isAddingCredit && (
            <form onSubmit={handleAddCredit} className="bg-card rounded-2xl p-5 border border-primary/20 flex flex-col gap-4">
              <h4 className="font-semibold text-sm">Registrar actividad</h4>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-foreground/60 ml-1">Categoría</label>
                <select 
                  className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newCredit.category}
                  onChange={e => setNewCredit(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option>Cursos</option>
                  <option>Seminarios</option>
                  <option>Investigación</option>
                  <option>Voluntariado</option>
                  <option>Otros</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-foreground/60 ml-1">Descripción de la actividad</label>
                <input 
                  type="text" 
                  placeholder="Ej: Curso de React Avanzado"
                  className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newCredit.activity}
                  required
                  onChange={e => setNewCredit(prev => ({ ...prev, activity: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-foreground/60 ml-1">Créditos a sumar</label>
                <input 
                  type="number" 
                  min="1"
                  className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newCredit.credits}
                  onChange={e => setNewCredit(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddingCredit(false)}
                  className="flex-1 py-3 text-sm font-medium text-foreground/60"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
                  disabled={isLoadingCredits}
                >
                  {isLoadingCredits ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4">
            {credits.length > 0 ? (
              credits.map(credit => (
                <div key={credit.id} className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 group flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded">
                        {credit.category}
                      </span>
                      <button 
                        onClick={() => deleteCredit(credit.id)}
                        className="p-1 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-base leading-tight">{credit.activity}</h3>
                    <p className="text-xs text-foreground/60 mt-1">
                      {new Date(credit.date).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-background px-3 py-2 rounded-xl min-w-[60px]">
                    <span className="text-xl font-bold text-primary">{credit.credits}</span>
                    <span className="text-[8px] uppercase font-bold text-foreground/40 leading-none">puntos</span>
                  </div>
                </div>
              ))
            ) : (
              !isAddingCredit && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-2xl border border-dashed border-foreground/10">
                  <Award size={48} className="text-foreground/20 mb-3" />
                  <h3 className="font-medium text-lg">No hay créditos registrados</h3>
                  <p className="text-sm text-foreground/60">
                    Sumá actividades extracurriculares para completar tu legajo académico.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
