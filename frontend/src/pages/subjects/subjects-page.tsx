import { BookOpen, CheckCircle2, ChevronRight, Clock, Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCredits } from '../../entities/credit/model/use-credits';
import { useSubjects } from '../../entities/subject/model/use-subjects';
import { CreditModal } from './credit-modal';


export const SubjectsPage = () => {
  const navigate = useNavigate();
  const { subjects, isLoading: isLoadingSubjects, error: errorSubjects } = useSubjects();
  const { credits, totalCredits, isLoading: isLoadingCredits, addCredit, deleteCredit } = useCredits();

  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');

  const isLoading = isLoadingSubjects || isLoadingCredits;
  const error = errorSubjects;

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

  // Filtered logic
  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesYear = yearFilter === 'ALL' || s.year?.toString() === yearFilter;
    const matchesPeriod = periodFilter === 'ALL' || s.period?.toString() === periodFilter;
    
    return matchesSearch && matchesStatus && matchesYear && matchesPeriod;
  });

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
            onClick={() => {
              setStatusFilter('ALL');
              setYearFilter('ALL');
              setPeriodFilter('ALL');
              setSearchQuery('');
            }}
            className="bg-card p-3 rounded-xl text-foreground/40 hover:text-primary transition-colors border border-foreground/5"
            title="Limpiar filtros"
          >
            <Filter size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-foreground/5 rounded-lg p-2 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-primary"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="REGULARIZADA">Regularizadas</option>
            <option value="PROMOCIONADA">Aprobadas</option>
          </select>

          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-card border border-foreground/5 rounded-lg p-2 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-primary"
          >
            <option value="ALL">Todos los Años</option>
            {[1, 2, 3, 4, 5].map(y => (
              <option key={y} value={y.toString()}>{y}° Año</option>
            ))}
          </select>

          <select 
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-card border border-foreground/5 rounded-lg p-2 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-primary"
          >
            <option value="ALL">Todo Período</option>
            <option value="1">1° Cuat.</option>
            <option value="2">2° Cuat.</option>
            <option value="0">Anual</option>
          </select>
        </div>

        {/* BRD US-05: Categorized Credits Tracker */}
        <div className="bg-card border border-foreground/5 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Créditos Extracurriculares</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">{totalCredits}</span>
                <span className="text-xs font-bold text-foreground/30">/ 35 Puntos Requeridos</span>
              </div>
            </div>
            <button 
              onClick={() => setIsCreditModalOpen(true)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
            >
               <Plus size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-1">
            {categories.map(cat => (
              <CreditCategory 
                key={cat.key} 
                label={cat.label} 
                count={getCategoryCount(cat.key)} 
                max={cat.max} 
              />
            ))}
          </div>
        </div>
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
                    <span>AÑO {subject.year} • {subject.period === 0 ? 'ANUAL' : `${subject.period}° C.`}</span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
      <CreditModal 
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        credits={credits}
        addCredit={addCredit}
        deleteCredit={deleteCredit}
      />
    </div>
  );
};


const CreditCategory = ({ label, count, max }: { label: string; count: number; max: number }) => (
  <div className="bg-background rounded-xl p-3 flex flex-col gap-1 border border-foreground/5">
    <span className="text-[10px] font-bold text-foreground/50 leading-none">{label}</span>
    <div className="flex justify-between items-end">
      <span className="text-sm font-black text-primary">{count}<span className="text-[10px] text-foreground/20 font-medium">/{max}</span></span>
      <div className="flex gap-0.5 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-3 rounded-full ${i < Math.ceil((count/max)*5) ? 'bg-primary' : 'bg-foreground/5'}`} 
          />
        ))}
      </div>
    </div>
  </div>
);

