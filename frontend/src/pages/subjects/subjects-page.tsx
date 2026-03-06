import { BookOpen, CheckCircle2, ChevronRight, Clock, Filter, Lock, Search, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSubjects } from '../../entities/subject/model/use-subjects';

const ENROLLMENT_ELIGIBLE = new Set(['REGULARIZADA', 'PROMOCIONADA', 'APROBADA']);
const RECOMMENDATION_ELIGIBLE = new Set(['PROMOCIONADA', 'APROBADA']);

export const SubjectsPage = () => {
  const navigate = useNavigate();
  const { subjects, isLoading, error } = useSubjects();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');

  const statusByCareerSubjectId = useMemo(() => {
    const map = new Map<string, string>();
    for (const subject of subjects) {
      if (subject.careerSubjectId) {
        map.set(subject.careerSubjectId, subject.status);
      }
    }
    return map;
  }, [subjects]);

  const processedSubjects = useMemo(() => {
    return subjects.map((subject) => {
      const prereqIds = subject.prerequisiteIds || [];
      const hasUnmetForEnrollment =
        subject.status === 'PENDIENTE' &&
        prereqIds.some((id) => {
          const prereqStatus = statusByCareerSubjectId.get(id);
          return !prereqStatus || !ENROLLMENT_ELIGIBLE.has(prereqStatus);
        });

      const isBlocked = Boolean(hasUnmetForEnrollment);

      const isRecommended =
        subject.status === 'PENDIENTE' &&
        !isBlocked &&
        prereqIds.every((id) => {
          const prereqStatus = statusByCareerSubjectId.get(id);
          return prereqStatus && RECOMMENDATION_ELIGIBLE.has(prereqStatus);
        });

      const visualStatus = isBlocked ? 'BLOQUEADA' : subject.status;

      return {
        ...subject,
        isBlocked,
        isRecommended,
        visualStatus,
      };
    });
  }, [subjects, statusByCareerSubjectId]);

  const filteredSubjects = useMemo(() => {
    return processedSubjects
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || s.visualStatus === statusFilter;
        const matchesYear = yearFilter === 'ALL' || s.year?.toString() === yearFilter;
        const matchesPeriod = periodFilter === 'ALL' || s.period?.toString() === periodFilter;
        return matchesSearch && matchesStatus && matchesYear && matchesPeriod;
      })
      .sort((a, b) => {
        const codeA = parseInt(a.code) || 0;
        const codeB = parseInt(b.code) || 0;
        return codeA - codeB;
      });
  }, [processedSubjects, searchQuery, statusFilter, yearFilter, periodFilter]);

  const hasAnnualSubjects = subjects.some((s) => s.period === 0);
  const recommendedCount = processedSubjects.filter((s) => s.isRecommended).length;

  const activeFiltersCount = [statusFilter !== 'ALL', yearFilter !== 'ALL', periodFilter !== 'ALL'].filter(Boolean)
    .length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-destructive/10 text-destructive rounded-2xl">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Mis Materias</h1>
          <p className="text-foreground/60 text-sm">
            {filteredSubjects.length} de {subjects.length} materias visibles
          </p>
        </div>

        <button
          onClick={() => setShowRecommendations((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border-none outline-none shadow-xl ${
            showRecommendations
              ? 'bg-primary text-primary-foreground shadow-primary/20'
              : 'bg-card text-foreground/40 hover:text-foreground border border-border/50'
          }`}
        >
          <Sparkles size={14} />
          {showRecommendations ? `RECOMENDADAS (${recommendedCount})` : 'MOSTRAR RECOMENDADAS'}
        </button>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              className="w-full bg-card border border-foreground/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`p-3 rounded-xl transition-all border flex items-center justify-center relative ${
              isFiltersOpen || activeFiltersCount > 0
                ? 'bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/5'
                : 'bg-card border-foreground/5 text-foreground/40 hover:text-primary'
            }`}
            title="Filtros"
          >
            <Filter size={20} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-background">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {isFiltersOpen && (
          <div className="bg-card border border-primary/10 rounded-2xl p-4 shadow-xl animate-in slide-in-from-top-2 duration-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Filtros Avanzados</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setYearFilter('ALL');
                    setPeriodFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Limpiar todo
                </button>
                <button onClick={() => setIsFiltersOpen(false)} className="text-foreground/20 hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="!bg-[#1a1a1a] border border-foreground/5 rounded-lg p-2.5 text-xs font-bold text-foreground/80 outline-none focus:ring-1 ring-primary w-full appearance-none"
                >
                  <option value="ALL" className="bg-[#1a1a1a]">Todos los Estados</option>
                  <option value="BLOQUEADA" className="bg-[#1a1a1a]">Bloqueadas</option>
                  <option value="PENDIENTE" className="bg-[#1a1a1a]">Pendientes</option>
                  <option value="EN_CURSO" className="bg-[#1a1a1a]">En Curso</option>
                  <option value="REGULARIZADA" className="bg-[#1a1a1a]">Regularizadas</option>
                  <option value="APROBADA" className="bg-[#1a1a1a]">Aprobadas (Final)</option>
                  <option value="PROMOCIONADA" className="bg-[#1a1a1a]">Promocionadas</option>
                  <option value="DESAPROBADA" className="bg-[#1a1a1a]">Desaprobadas</option>
                  <option value="RECURSANDO" className="bg-[#1a1a1a]">Recursando</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Año</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="!bg-[#1a1a1a] border border-foreground/5 rounded-lg p-2.5 text-xs font-bold text-foreground/80 outline-none focus:ring-1 ring-primary w-full appearance-none"
                >
                  <option value="ALL" className="bg-[#1a1a1a]">Todos los Años</option>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y.toString()} className="bg-[#1a1a1a]">{y}° Año</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-foreground/30 ml-1">Cuatrimestre</label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="!bg-[#1a1a1a] border border-foreground/5 rounded-lg p-2.5 text-xs font-bold text-foreground/80 outline-none focus:ring-1 ring-primary w-full appearance-none"
                >
                  <option value="ALL" className="bg-[#1a1a1a]">Todo Período</option>
                  <option value="1" className="bg-[#1a1a1a]">1° Cuat.</option>
                  <option value="2" className="bg-[#1a1a1a]">2° Cuat.</option>
                  {hasAnnualSubjects && <option value="0" className="bg-[#1a1a1a]">Anual</option>}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {filteredSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-foreground/40 gap-3 bg-card/30 rounded-3xl border border-dashed border-foreground/10">
            <BookOpen size={48} className="opacity-20" />
            <div className="text-center">
              <p className="font-bold">No se encontraron materias</p>
              <p className="text-xs opacity-60">Probá ajustando los filtros o la búsqueda.</p>
            </div>
          </div>
        ) : (
          filteredSubjects.map((subject) => {
            const visualStatus = subject.visualStatus;
            const highlightRecommended = showRecommendations && subject.isRecommended;

            return (
              <button
                key={subject.id}
                onClick={() => navigate(`/materias/${subject.id}`)}
                className={`bg-card rounded-2xl p-5 shadow-sm border transition-all group text-left w-full relative overflow-hidden ${
                  highlightRecommended
                    ? 'border-amber-400/50 shadow-[0_0_18px_rgba(251,191,36,0.2)]'
                    : 'border-foreground/5 hover:border-primary/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded uppercase tracking-wider">
                    {subject.code}
                  </span>
                  <div className="flex items-center gap-2">
                    {highlightRecommended && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-amber-400 text-amber-950">
                        <Sparkles size={10} />
                        Recomendada
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                        visualStatus === 'BLOQUEADA'
                          ? 'bg-[#181818] text-foreground/30 border border-foreground/10'
                          : visualStatus === 'PROMOCIONADA'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : visualStatus === 'APROBADA'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : visualStatus === 'EN_CURSO'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                : visualStatus === 'REGULARIZADA'
                                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                  : visualStatus === 'DESAPROBADA'
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    : visualStatus === 'RECURSANDO'
                                      ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                      : 'bg-foreground/5 text-foreground/30 border border-foreground/10'
                      }`}
                    >
                      {visualStatus.replace('_', ' ')}
                    </span>
                    {subject.status === 'RECURSANDO' && subject.attemptCount > 1 && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-purple-500 text-white shadow-sm">
                        #{subject.attemptCount}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-base group-hover:text-primary transition-colors flex items-center justify-between pr-4">
                  <span className="inline-flex items-center gap-2">
                    {visualStatus === 'BLOQUEADA' && <Lock size={14} className="text-foreground/30" />}
                    {subject.name}
                  </span>
                  <ChevronRight size={16} className="text-foreground/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </h3>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 bg-foreground/5 px-2 py-1 rounded-lg">
                    <Clock size={12} />
                    <span>{subject.hours}hs</span>
                  </div>
                  {subject.grade !== undefined && subject.grade !== null && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      <CheckCircle2 size={12} />
                      <span>NOTA: {Number(subject.grade).toFixed(2)}</span>
                    </div>
                  )}
                  {subject.year && (
                    <div className="flex items-center gap-1.5 ml-auto text-[10px] font-black text-foreground/30 uppercase tracking-tighter">
                      <span>
                        AÑO {subject.year} • {subject.period === 0 ? 'ANUAL' : `${subject.period}° C.`}
                        {subject.completionYear && (
                          <span className="text-primary ml-1">
                            • {subject.completionYear} ({subject.completionPeriod}° C.)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
