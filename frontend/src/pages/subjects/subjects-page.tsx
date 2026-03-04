import { BookOpen, CheckCircle2, ChevronRight, Clock, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSubjects } from '../../entities/subject/model/use-subjects';


export const SubjectsPage = () => {
  const navigate = useNavigate();
  const { subjects, isLoading, error } = useSubjects();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');

  // Filtered logic
  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || s.year?.toString() === yearFilter;
    
    // Strict period comparison: periodFilter value is string '0', '1', '2'
    const matchesPeriod = periodFilter === 'ALL' || s.period?.toString() === periodFilter;
    
    return matchesSearch && matchesStatus && matchesYear && matchesPeriod;
  });

  const hasAnnualSubjects = subjects.some(s => s.period === 0);

  const activeFiltersCount = [
    statusFilter !== 'ALL',
    yearFilter !== 'ALL',
    periodFilter !== 'ALL'
  ].filter(Boolean).length;

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
            {filteredSubjects.length} de {subjects.length} materias visibles
          </p>
        </div>
      </header>

      {/* Advanced Filters & Search */}
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

        {/* Filters Panel Popover-like */}
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
                  <option value="PENDIENTE" className="bg-[#1a1a1a]">Pendientes</option>
                  <option value="EN_CURSO" className="bg-[#1a1a1a]">En Curso</option>
                  <option value="REGULARIZADA" className="bg-[#1a1a1a]">Regularizadas</option>
                  <option value="PROMOCIONADA" className="bg-[#1a1a1a]">Aprobadas</option>
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
                  {[1, 2, 3, 4, 5].map(y => (
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


      {/* Subjects List */}
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
          filteredSubjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => navigate(`/materias/${subject.id}`)}
              className="bg-card rounded-2xl p-5 shadow-sm border border-foreground/5 hover:border-primary/20 transition-all group text-left w-full relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded uppercase tracking-wider">
                  {subject.code}
                </span>
                <div className="flex items-center gap-2">
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                    subject.status === 'PROMOCIONADA' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                    subject.status === 'EN_CURSO' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 
                    subject.status === 'REGULARIZADA' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                    subject.status === 'DESAPROBADA' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    subject.status === 'RECURSANDO' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                    'bg-foreground/5 text-foreground/30 border border-foreground/10'
                  }`}>
                    {subject.status.replace('_', ' ')}
                  </span>
                  {subject.status === 'RECURSANDO' && subject.attemptCount > 1 && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-purple-500 text-white shadow-sm">
                      #{subject.attemptCount}
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-base group-hover:text-primary transition-colors flex items-center justify-between pr-4">
                {subject.name}
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
          ))
        )}
      </div>
    </div>
  );
};

