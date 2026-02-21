import { BookOpen, CheckCircle2, ChevronRight, Filter, GraduationCap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../../entities/subject/model/use-subjects';

export const SubjectsPage = () => {
  const navigate = useNavigate();
  const { subjects, isLoading, error, studentCredits, updateStudentCredits } = useSubjects();

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
          <p className="text-foreground/60 text-sm">
            {subjects.length} materias en total
          </p>
        </div>
      </header>

      {/* Filters & Search & Credits */}
      <div className="flex flex-col gap-4">
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

        {/* Extracurricular Credits Tracker */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-primary/60 uppercase">Créditos Extracurriculares</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">{studentCredits}</span>
              <span className="text-sm font-medium text-foreground/40">/ 35</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateStudentCredits(Math.max(0, studentCredits - 1))}
              className="w-8 h-8 rounded-full bg-card border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors"
              aria-label="Restar crédito"
            >
              -
            </button>
            <button 
              onClick={() => updateStudentCredits(studentCredits + 1)}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Sumar crédito"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="flex flex-col gap-4">
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground/40 gap-3">
            <BookOpen size={48} />
            <p>No tienes materias cargadas aún.</p>
            <p className="text-xs">Las materias se cargan automáticamente desde tu carrera.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => navigate(`/materias/${subject.id}`)}
              className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 hover:border-primary/20 transition-all group text-left w-full"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg uppercase tracking-wider">
                  {subject.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                  subject.status === 'PROMOCIONADA' ? 'bg-green-500/10 text-green-500' : 
                  subject.status === 'EN_CURSO' ? 'bg-blue-500/10 text-blue-500' : 
                  subject.status === 'REGULARIZADA' ? 'bg-yellow-500/10 text-yellow-500' :
                  subject.status === 'DESAPROBADA' ? 'bg-red-500/10 text-red-500' :
                  subject.status === 'RECURSANDO' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-foreground/10 text-foreground/40'
                }`}>
                  {subject.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors flex items-center justify-between">
                {subject.name}
                <ChevronRight size={18} className="text-foreground/20 group-hover:text-primary/60 transition-colors" />
              </h3>
              
              <div className="flex items-center gap-4 mt-4 text-xs text-foreground/60">
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={14} />
                  <span>{subject.hours} Horas</span>
                </div>
                {subject.grade !== undefined && subject.grade !== null && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="font-bold text-foreground">Nota: {Number(subject.grade).toFixed(2)}</span>
                  </div>
                )}
                {subject.year && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span>AÑO {subject.year} - {subject.period}° C.</span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
