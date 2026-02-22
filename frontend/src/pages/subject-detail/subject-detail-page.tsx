import type { StudentSubjectResponse } from '@/entities/subject/api/subject-api';
import { subjectApi } from '@/entities/subject/api/subject-api';
import { useExams } from '@/entities/subject/model/use-exams';
import { useSubjectNotes } from '@/entities/subject/model/use-subject-notes';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Clock,
    Edit3,
    ExternalLink,
    FileText,
    GraduationCap,
    Plus,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-gray-500/10 text-gray-500' },
  EN_CURSO: { label: 'En Curso', color: 'bg-blue-500/10 text-blue-500' },
  REGULARIZADA: { label: 'Regularizada', color: 'bg-yellow-500/10 text-yellow-500' },
  PROMOCIONADA: { label: 'Promocionada', color: 'bg-green-500/10 text-green-500' },
  DESAPROBADA: { label: 'Desaprobada', color: 'bg-red-500/10 text-red-500' },
  RECURSANDO: { label: 'Recursando', color: 'bg-purple-500/10 text-purple-500' },
};

export const SubjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<StudentSubjectResponse | null>(null);
  const [isLoadingSubject, setIsLoadingSubject] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'exams'>('info');

  const { notes, isLoading: isLoadingNotes, addNote, deleteNote } = useSubjectNotes(id || '');
  const { exams, isLoading: isLoadingExams, addExam, updateExam, deleteExam } = useExams(id || '');
  
  // Form states
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState({ title: '', content: '', url: '' });
  const [newExam, setNewExam] = useState({ 
    type: 'Parcial 1', 
    date: new Date().toISOString().split('T')[0], 
    grade: '' 
  });

  useEffect(() => {
    const fetchSubject = async () => {
      if (!id) return;
      try {
        const data = await subjectApi.getById(id);
        setSubject(data);
      } catch (err) {
        console.error('Error fetching subject:', err);
      } finally {
        setIsLoadingSubject(false);
      }
    };
    fetchSubject();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNote({
        title: newNote.title || 'Nueva nota',
        content: newNote.content,
        url: newNote.url
      });
      setNewNote({ title: '', content: '', url: '' });
      setIsAddingNote(false);
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExamId) {
        await updateExam(editingExamId, {
          type: newExam.type,
          date: newExam.date || undefined,
          grade: newExam.grade ? parseFloat(newExam.grade) : undefined
        });
        setEditingExamId(null);
      } else {
        await addExam({
          type: newExam.type,
          date: newExam.date || undefined,
          grade: newExam.grade ? parseFloat(newExam.grade) : undefined
        });
      }
      setIsAddingExam(false);
      setNewExam({ type: 'Parcial 1', date: new Date().toISOString().split('T')[0], grade: '' });
    } catch (err) {
      console.error('Error saving exam:', err);
    }
  };

  const startEditingExam = (exam: any) => {
    setEditingExamId(exam.id);
    setNewExam({
      type: exam.type,
      date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
      grade: exam.grade !== null ? exam.grade.toString() : ''
    });
    setIsAddingExam(true);
  };

  if (isLoadingSubject) {
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
              {subject.careerSubject.code}
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{subject.careerSubject.subject.name}</h1>
          <p className="text-sm text-foreground/60">
            Año {subject.careerSubject.year} - {subject.careerSubject.period}° Cuatrimestre
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
                    {subject.courseGrade?.toFixed(2) || '-'}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-4">
                  <span className="text-xs text-foreground/60">Final</span>
                  <p className="text-2xl font-bold">
                    {subject.finalGrade?.toFixed(2) || '-'}
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
                <p className="text-xl font-bold">{subject.careerSubject.subject.hours} horas</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col gap-4">
            {!isAddingNote ? (
              <button 
                onClick={() => setIsAddingNote(true)}
                className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20"
              >
                <Plus size={18} />
                Agregar nota o link
              </button>
            ) : (
              <form onSubmit={handleAddNote} className="bg-card rounded-2xl p-5 border border-primary/20 flex flex-col gap-3">
                <h4 className="font-semibold text-sm">Nueva nota / link</h4>
                <input 
                  type="text" 
                  placeholder="Título (ej: Apuntes de clase)"
                  className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newNote.title}
                  onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                />
                <textarea 
                  placeholder="Contenido o descripción"
                  className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none min-h-[80px]"
                  value={newNote.content}
                  onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                />
                <input 
                  type="url" 
                  placeholder="URL (opcional, ej: https://...)"
                  className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                  value={newNote.url}
                  onChange={e => setNewNote(prev => ({ ...prev, url: e.target.value }))}
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="flex-1 py-2 text-sm font-medium text-foreground/60"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                    disabled={isLoadingNotes}
                  >
                    {isLoadingNotes ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {notes.length > 0 ? (
                notes.map(note => (
                  <div key={note.id} className="bg-card rounded-2xl p-4 border border-foreground/5 group">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{note.title}</h4>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {note.content && <p className="text-sm text-foreground/70 mb-3">{note.content}</p>}
                    {note.url && (
                      <a 
                        href={note.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 p-2 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Abrir recurso
                      </a>
                    )}
                  </div>
                ))
              ) : (
                !isAddingNote && (
                  <div className="text-center py-12 text-foreground/40">
                    <Edit3 size={48} className="mx-auto mb-3" />
                    <p>No hay notas aún</p>
                    <p className="text-sm">Agregá apuntes o links útiles</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="flex flex-col gap-4">
            {!isAddingExam ? (
              <button 
                onClick={() => setIsAddingExam(true)}
                className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20"
              >
                <Plus size={18} />
                Registrar parcial o nota
              </button>
            ) : (
              <form onSubmit={handleAddExam} className="bg-card rounded-2xl p-5 border border-primary/20 flex flex-col gap-3">
                <h4 className="font-semibold text-sm">
                  {editingExamId ? 'Editar calificación' : 'Registrar calificación'}
                </h4>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">Tipo de instancia</label>
                  <select 
                    className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                    value={newExam.type}
                    onChange={e => setNewExam(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option>Parcial 1</option>
                    <option>Parcial 2</option>
                    <option>Recuperatorio</option>
                    <option>Trabajo Práctico</option>
                    <option>Final</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">Fecha</label>
                  <input 
                    type="date" 
                    className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                    value={newExam.date}
                    onChange={e => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-foreground/40 ml-1">Nota (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="Ej: 7.50"
                    className="bg-background border-none rounded-lg p-3 text-sm focus:ring-1 ring-primary outline-none"
                    value={newExam.grade}
                    onChange={e => setNewExam(prev => ({ ...prev, grade: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingExam(false);
                      setEditingExamId(null);
                      setNewExam({ type: 'Parcial 1', date: new Date().toISOString().split('T')[0], grade: '' });
                    }}
                    className="flex-1 py-2 text-sm font-medium text-foreground/60"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                    disabled={isLoadingExams}
                  >
                    {isLoadingExams ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {exams.length > 0 ? (
                exams.map(exam => (
                  <div key={exam.id} className="bg-card rounded-2xl p-4 border border-foreground/5 group flex items-center justify-between transition-all hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <FileText size={20} className="text-primary/40" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm leading-tight">{exam.type}</h4>
                          {exam.date && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500" title="Sincronizado con calendario">
                              <Calendar size={10} />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Sync</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-foreground/40 mt-1">
                          {exam.date 
                            ? new Date(exam.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                            : 'Sin fecha'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {exam.grade !== null && (
                        <div className="text-right mr-2">
                          <span className={`text-xl font-black ${Number(exam.grade) >= 4 ? 'text-primary' : 'text-red-500'}`}>
                            {Number(exam.grade).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => startEditingExam(exam)}
                          className="p-1.5 text-foreground/20 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteExam(exam.id)}
                          className="p-1.5 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !isAddingExam && (
                  <div className="text-center py-12 text-foreground/40">
                    <FileText size={48} className="mx-auto mb-3" />
                    <p>No hay exámenes registrados</p>
                    <p className="text-sm">Registrá tus notas parciales aquí</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
