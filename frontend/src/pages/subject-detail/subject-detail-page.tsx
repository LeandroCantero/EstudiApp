import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Edit3, 
  FileText,
  GraduationCap,
  Plus
} from 'lucide-react';
import { subjectApi } from '@/entities/subject/api/subject-api';
import type { StudentSubjectResponse } from '@/entities/subject/api/subject-api';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-gray-500/10 text-gray-500' },
  EN_CURSO: { label: 'En Curso', color: 'bg-blue-500/10 text-blue-500' },
  REGULARIZADA: { label: 'Regularizada', color: 'bg-yellow-500/10 text-yellow-500' },
  PROMOCIONADA: { label: 'Promocionada', color: 'bg-green-500/10 text-green-500' },
  APROBADA: { label: 'Aprobada', color: 'bg-green-500/10 text-green-500' },
  DESAPROBADA: { label: 'Desaprobada', color: 'bg-red-500/10 text-red-500' },
  RECUSANDO: { label: 'Recursando', color: 'bg-purple-500/10 text-purple-500' },
};

export const SubjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<StudentSubjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'exams'>('info');

  useEffect(() => {
    const fetchSubject = async () => {
      if (!id) return;
      try {
        const data = await subjectApi.getById(id);
        setSubject(data);
      } catch (err) {
        console.error('Error fetching subject:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-foreground/60">Materia no encontrada</p>
        <button
          onClick={() => navigate('/materias')}
          className="text-primary font-medium hover:underline"
        >
          Volver a materias
        </button>
      </div>
    );
  }

  const status = statusLabels[subject.status] || statusLabels.PENDIENTE;

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <header className="flex items-start gap-4">
        <button
          onClick={() => navigate('/materias')}
          className="p-2 bg-card rounded-xl hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
              {subject.subject.code}
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{subject.subject.name}</h1>
          <p className="text-sm text-foreground/60">
            Año {subject.subject.year} - {subject.subject.period}° Cuatrimestre
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-card rounded-xl">
        {[
          { id: 'info', label: 'Información', icon: BookOpen },
          { id: 'notes', label: 'Notas', icon: Edit3 },
          { id: 'exams', label: 'Exámenes', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {activeTab === 'info' && (
          <>
            {/* Grades */}
            <div className="bg-card rounded-2xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                Calificaciones
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4">
                  <span className="text-xs text-foreground/60">Cursada</span>
                  <p className="text-2xl font-bold">
                    {subject.grade?.toFixed(1) || '-'}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-4">
                  <span className="text-xs text-foreground/60">Final</span>
                  <p className="text-2xl font-bold">
                    {subject.finalGrade?.toFixed(1) || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={24} className="text-primary" />
              </div>
              <div>
                <span className="text-xs text-foreground/60">Carga Horaria</span>
                <p className="text-xl font-bold">{subject.subject.hours} horas</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium">
              <Plus size={18} />
              Agregar nota
            </button>

            <div className="text-center py-12 text-foreground/40">
              <Edit3 size={48} className="mx-auto mb-3" />
              <p>No hay notas aún</p>
              <p className="text-sm">Agregá apuntes o links útiles</p>
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="text-center py-12 text-foreground/40">
            <FileText size={48} className="mx-auto mb-3" />
            <p>Próximamente</p>
            <p className="text-sm">Registro de parciales y finales</p>
          </div>
        )}
      </div>
    </div>
  );
};
