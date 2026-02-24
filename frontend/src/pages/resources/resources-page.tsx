import { useCredits } from '@/entities/credit/model/use-credits';
import { Award, BookMarked, ExternalLink, Link2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Resource {
  id: string;
  category: string;
  title: string;
  url: string;
  description?: string;
}

export const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'credits'>('global');
  
  const { credits, totalCredits, isLoading: isLoadingCredits, addCredit, deleteCredit } = useCredits();
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  const [newCredit, setNewCredit] = useState({ category: 'Formación', activity: '', credits: 1 });

  const globalResources: Resource[] = [
    {
      id: 'siu',
      category: 'Institucional',
      title: 'SIU Guaraní - Gestión de Alumnos',
      url: 'https://servicios.unahur.edu.ar/unahur3w/',
      description: 'Inscripción a materias, finales y consulta de historia académica oficial.',
    },
    {
      id: 'campus',
      category: 'Académico',
      title: 'Campus Virtual UNAHUR',
      url: 'https://campus.unahur.edu.ar/',
      description: 'Acceso a aulas virtuales, materiales de cátedra y entrega de tareas.',
    },
    {
      id: 'web',
      category: 'Institucional',
      title: 'Portal Oficial UNAHUR',
      url: 'https://unahur.edu.ar/',
      description: 'Sitio web principal de la Universidad Nacional de Hurlingham.',
    },
    {
      id: 'cal',
      category: 'Académico',
      title: 'Calendario Académico Oficial',
      url: 'https://unahur.edu.ar/calendario-academico/',
      description: 'Fechas de inscripciones, recesos y finales definidos por la universidad.',
    },
    {
      id: 'donde',
      category: 'Utilidad',
      title: 'CPU Donde Curso',
      url: 'https://cpudondecurso.unahur.edu.ar/',
      description: 'Consulta rápida de aulas y horarios de cursada.',
    },
  ];

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCredit(newCredit);
      setNewCredit({ category: 'Formación', activity: '', credits: 1 });
      setIsAddingCredit(false);
    } catch (err) {
      console.error('Error adding credit:', err);
    }
  };

  const categories = [
    { label: 'Formación', key: 'Formación', max: 20 },
    { label: 'Investigación', key: 'Investigación', max: 10 },
    { label: 'Extensión', key: 'Extensión', max: 10 },
    { label: 'Otros', key: 'Otros', max: 5 },
  ];

  const getCategoryCount = (key: string) => {
    return credits
      .filter(c => c.category === key)
      .reduce((sum, c) => sum + c.credits, 0);
  };

  return (
    <div className="flex flex-col gap-8 pb-24 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-primary mb-1">
           <BookMarked size={28} />
           <h1 className="text-3xl font-black tracking-tight uppercase">Hub de Recursos</h1>
        </div>
        <p className="text-foreground/50 text-base font-medium">Accesos directos, herramientas institucionales y seguimiento de créditos.</p>
      </header>

      {/* Tabs con diseño premium */}
      <div className="flex p-1.5 bg-card border border-foreground/5 rounded-2xl shadow-inner">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
            activeTab === 'global'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
              : 'text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <Link2 size={18} />
          Institucional
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
            activeTab === 'credits'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
              : 'text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5'
          }`}
        >
          <Award size={18} />
          Créditos ({totalCredits})
        </button>
      </div>

      {/* Institutional Resources */}
      {activeTab === 'global' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {globalResources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card rounded-3xl p-6 shadow-sm border border-foreground/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <ExternalLink size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded-lg">
                  {resource.category}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-sm text-foreground/50 leading-relaxed">{resource.description}</p>
                )}
              </div>
            </a>
          ))}
          
        </div>
      )}


      {/* Credits Hub */}
      {activeTab === 'credits' && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {categories.map(cat => (
               <div key={cat.key} className="bg-card border border-foreground/5 rounded-2xl p-4 flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter">{cat.label}</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-primary">{getCategoryCount(cat.key)}</span>
                    <span className="text-[10px] font-bold text-foreground/20">/ {cat.max}</span>
                 </div>
               </div>
             ))}
          </div>

          <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-xl shadow-primary/20 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Acumulado</span>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-4xl font-black">{totalCredits}</h2>
                   <span className="text-sm font-bold opacity-60">de 35 puntos</span>
                </div>
             </div>
             {!isAddingCredit && (
               <button 
                 onClick={() => setIsAddingCredit(true)}
                 className="bg-white text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-110 active:scale-95 transition-all"
               >
                 Cargar Actividad
               </button>
             )}
          </div>

          {isAddingCredit && (
            <form onSubmit={handleAddCredit} className="bg-card rounded-3xl p-8 border-2 border-primary/20 flex flex-col gap-6 animate-in zoom-in duration-200 shadow-2xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black uppercase tracking-tight">Registrar Nueva Actividad</h4>
                <Award className="text-primary" size={24} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Categoría</label>
                  <select 
                    className="bg-foreground/5 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-primary outline-none appearance-none"
                    value={newCredit.category}
                    onChange={e => setNewCredit(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option>Formación</option>
                    <option>Investigación</option>
                    <option>Extensión</option>
                    <option>Otros</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Puntos a Sumar</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    className="bg-foreground/5 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-primary outline-none"
                    value={newCredit.credits}
                    onChange={e => setNewCredit(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Descripción / Evento / Actividad</label>
                <input 
                  type="text" 
                  placeholder="Ej: Curso de programación funcional"
                  className="bg-foreground/5 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-primary outline-none"
                  value={newCredit.activity}
                  required
                  onChange={e => setNewCredit(prev => ({ ...prev, activity: e.target.value }))}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddingCredit(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  disabled={isLoadingCredits}
                >
                  {isLoadingCredits ? 'Procesando...' : 'Confirmar Carga'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Historial Reciente</h3>
            {credits.length > 0 ? (
              credits.map(credit => (
                <div key={credit.id} className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 group flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Award size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        {credit.category}
                      </span>
                      <button 
                        onClick={() => deleteCredit(credit.id)}
                        className="p-1.5 text-foreground/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="font-bold text-base leading-tight">{credit.activity}</h3>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-tighter mt-0.5">
                      {new Date(credit.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-background px-4 py-2 rounded-2xl min-w-[70px] border border-foreground/5 shadow-inner">
                    <span className="text-2xl font-black text-primary">+{credit.credits}</span>
                    <span className="text-[8px] uppercase font-black text-foreground/30 leading-none">puntos</span>
                  </div>
                </div>
              ))
            ) : (
              !isAddingCredit && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-[40px] border-2 border-dashed border-foreground/5">
                  <div className="p-6 bg-foreground/5 rounded-full mb-4">
                    <Award size={64} className="text-foreground/10" />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight mb-2">Sin actividad registrada</h3>
                  <p className="text-sm text-foreground/40 max-w-xs font-medium">
                    Todavía no cargaste ningún crédito extracurricular. Sumá puntos con cursos, seminarios o participación en proyectos.
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
;
