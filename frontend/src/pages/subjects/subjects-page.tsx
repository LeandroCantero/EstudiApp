import { BookOpen, CheckCircle2, Filter, GraduationCap, Plus, Search } from 'lucide-react';
import { useSubjects } from '../../entities/subject/model/use-subjects';

export const SubjectsPage = () => {
  const { subjects, isLoading, error } = useSubjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-2xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Materias</h1>
          <p className="text-foreground/60 text-sm">Gestiona tu historial académico y cursadas actuales.</p>
        </div>
        <button className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Plus size={24} />
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input 
            type="text" 
            placeholder="Buscar materia..." 
            className="w-full bg-card border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <button className="bg-card p-3 rounded-xl text-foreground/60 hover:text-foreground transition-colors border-none outline-none">
          <Filter size={20} />
        </button>
      </div>

      {/* Subjects List */}
      <div className="flex flex-col gap-4">
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground/40 gap-3">
            <BookOpen size={48} />
            <p>No tienes materias cargadas aún.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg uppercase tracking-wider">
                  {subject.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                  subject.status === 'APROBADA' ? 'bg-green-500/10 text-green-500' : 
                  subject.status === 'EN_CURSO' ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/40'
                }`}>
                  {subject.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{subject.name}</h3>
              
              <div className="flex items-center gap-4 mt-4 text-xs text-foreground/60">
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={14} />
                  <span>{subject.credits} Créditos</span>
                </div>
                {subject.grade && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="font-bold text-foreground">Nota: {subject.grade}</span>
                  </div>
                )}
                {subject.year && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span>AÑO {subject.year} - {subject.period}° C.</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
