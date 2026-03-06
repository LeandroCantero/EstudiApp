import type { StudentSubjectResponse } from '@/entities/subject/api/subject-api';
import { subjectApi } from '@/entities/subject/api/subject-api';
import { useExams } from '@/entities/subject/model/use-exams';
import { useSubjectNotes } from '@/entities/subject/model/use-subject-notes';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    FileText,
    GraduationCap,
    Plus,
    RotateCcw,
    Trash2,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-gray-500/10 text-gray-500' },
  EN_CURSO: { label: 'En Curso', color: 'bg-blue-500/10 text-blue-500' },
  REGULARIZADA: { label: 'Regularizada', color: 'bg-yellow-500/10 text-yellow-500' },
  PROMOCIONADA: { label: 'Promocionada', color: 'bg-green-500/10 text-green-500 border border-green-500/30' },
  APROBADA: { label: 'Aprobada', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' },
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

  const [courseGrade, setCourseGrade] = useState('');
  const [finalGrade, setFinalGrade] = useState('');
  const [attemptCount, setAttemptCount] = useState<string>('1');
  const [completionYear, setCompletionYear] = useState<string>(new Date().getFullYear().toString());
  const [completionPeriod, setCompletionPeriod] = useState<string>('1');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [transitionWarnings, setTransitionWarnings] = useState<string[]>([]);
  const [isManualAttemptEditing, setIsManualAttemptEditing] = useState(false);
  const [manualAttemptDraft, setManualAttemptDraft] = useState('1');
  
  // Feedback states
  const [savingCourseGrade, setSavingCourseGrade] = useState(false);
  const [savingFinalGrade, setSavingFinalGrade] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditingCompletionDate, setIsEditingCompletionDate] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      if (!id) return;
      try {
        const data = await subjectApi.getById(id);
        setSubject(data);
        setCourseGrade(data.courseGrade?.toString() || '');
        setFinalGrade(data.finalGrade?.toString() || '');
        setAttemptCount(data.attemptCount.toString());
        setManualAttemptDraft(data.attemptCount.toString());
        if (data.completionYear) setCompletionYear(data.completionYear.toString());
        if (data.completionPeriod) setCompletionPeriod(data.completionPeriod.toString());
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

  const handleUpdateStatus = async (status: string, grade?: number, manualAttempt?: number) => {
    if (!id) return;
    try {
      setDetailError(null);
      setTransitionWarnings([]);
      setSuccessMessage(null);

      const payload: any = {
        status: status as any,
        courseGrade: grade,
        attemptCount: manualAttempt !== undefined ? manualAttempt : parseInt(attemptCount),
      };

      if (status !== 'PENDIENTE') {
        const year = parseInt(completionYear);
        const period = parseInt(completionPeriod);
        if (!isNaN(year)) payload.completionYear = year;
        if (!isNaN(period)) payload.completionPeriod = period;
      }

      const updated = await subjectApi.updateStatus(id, payload);
      setSubject(updated);
      setCourseGrade(updated.courseGrade?.toString() || '');
      setAttemptCount(updated.attemptCount.toString());
      setManualAttemptDraft(updated.attemptCount.toString());
      setTransitionWarnings((updated.transitionWarnings || []).map((warning) => warning.message));
      setIsManualAttemptEditing(false);
      
      if (grade !== undefined) {
        setSuccessMessage('Nota de cursada guardada');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setDetailError(err?.message || 'Error al actualizar el estado');
    }
  };

  const handleSaveCourseGrade = async () => {
    if (!id) return;
    setSavingCourseGrade(true);
    setSuccessMessage(null);
    try {
      const updated = await subjectApi.updateStatus(id, {
        status: subject.status as any,
        courseGrade: parseFloat(courseGrade),
      });
      setSubject(updated);
      setCourseGrade(updated.courseGrade?.toString() || '');
      setSuccessMessage('Nota de cursada guardada');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving course grade:', err);
      setDetailError(err?.message || 'Error al guardar la nota');
    } finally {
      setSavingCourseGrade(false);
    }
  };

  const handleUpdateCompletionDate = async () => {
    if (!id) return;
    try {
      setSuccessMessage(null);
      const updated = await subjectApi.updateStatus(id, {
        status: subject.status as any,
        completionYear: parseInt(completionYear),
        completionPeriod: parseInt(completionPeriod),
      });
      setSubject(updated);
      if (updated.completionYear) setCompletionYear(updated.completionYear.toString());
      if (updated.completionPeriod) setCompletionPeriod(updated.completionPeriod.toString());
      setIsEditingCompletionDate(false);
      setSuccessMessage('Fecha actualizada');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating completion date:', err);
      setDetailError(err?.message || 'Error al actualizar la fecha');
    }
  };

  const handleResetSubject = async () => {
    if (!id) return;
    try {
      setDetailError(null);
      const updated = await subjectApi.resetSubject(id, false);
      setSubject(updated);
      setCourseGrade('');
      setFinalGrade('');
      setAttemptCount(updated.attemptCount.toString());
      setManualAttemptDraft(updated.attemptCount.toString());
      setShowResetConfirm(false);
    } catch (err: any) {
      console.error('Error resetting subject:', err);
      setDetailError(err?.message || 'Error al reiniciar la materia');
    }
  };
  const handleRegisterFinal = async () => {
    if (!id || !finalGrade) return;
    try {
      setDetailError(null);
      setSuccessMessage(null);
      setSavingFinalGrade(true);
      const payload: any = { 
        grade: parseFloat(finalGrade)
      };

      const year = parseInt(completionYear);
      const period = parseInt(completionPeriod);
      if (!isNaN(year)) payload.completionYear = year;
      if (!isNaN(period)) payload.completionPeriod = period;

      const updated = await subjectApi.updateFinal(id, payload);
      setSubject(updated);
      setFinalGrade(updated.finalGrade?.toString() || '');
      setSuccessMessage('Final registrado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error registering final:', err);
      setDetailError(err?.message || 'Error al registrar el final');
    } finally {
      setSavingFinalGrade(false);
    }
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
            Año {subject.careerSubject.year} - {subject.careerSubject.period === 0 ? 'Anual' : `${subject.careerSubject.period}° Cuatrimestre`}
            {subject.completionYear && (
              <span className="ml-2 text-primary font-bold flex items-center gap-1 inline-flex">
                • {subject.completionYear} ({subject.completionPeriod}° C.)
                <button 
                  onClick={() => setIsEditingCompletionDate(true)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  title="Editar fecha"
                >
                  <Edit3 size={12} />
                </button>
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2"
          title="Reiniciar materia"
        >
          <RotateCcw size={18} />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Reiniciar</span>
        </button>
      </header>

      {/* Error Alert */}
      {detailError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-500 mb-1">Conflicto de Correlatividades / Validación</h4>
            <p className="text-xs text-red-500/80 leading-relaxed">{detailError}</p>
          </div>
          <button onClick={() => setDetailError(null)} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors">
            <X size={16} className="text-red-500/40" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <Check className="text-green-500 shrink-0" size={20} />
          <p className="text-sm text-green-500 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Completion Date Edit Modal */}
      {isEditingCompletionDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-foreground/5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Editar Fecha</h3>
                <p className="text-sm text-foreground/60 mt-2">
                  Cambiá el año y cuatrimestre de cursada/final
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-foreground/30 ml-1">Año</label>
                  <select 
                    value={completionYear}
                    onChange={(e) => setCompletionYear(e.target.value)}
                    className="!bg-background border border-foreground/10 rounded-xl p-3 text-sm font-bold text-foreground/80 outline-none focus:ring-1 ring-primary appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-foreground/30 ml-1">Cuatrimestre</label>
                  <select 
                    value={completionPeriod}
                    onChange={(e) => setCompletionPeriod(e.target.value)}
                    className="!bg-background border border-foreground/10 rounded-xl p-3 text-sm font-bold text-foreground/80 outline-none focus:ring-1 ring-primary appearance-none cursor-pointer"
                  >
                    <option value="1">1° Cuatrimestre</option>
                    <option value="2">2° Cuatrimestre</option>
                    <option value="0">Anual / Verano</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col w-full gap-2 mt-2">
                <button
                  onClick={handleUpdateCompletionDate}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditingCompletionDate(false);
                    // Reset to original values
                    if (subject.completionYear) setCompletionYear(subject.completionYear.toString());
                    if (subject.completionPeriod) setCompletionPeriod(subject.completionPeriod.toString());
                  }}
                  className="w-full py-3 bg-transparent text-foreground/40 font-bold hover:text-foreground/60 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {transitionWarnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <h4 className="text-sm font-bold text-amber-600 mb-2">Advertencia</h4>
          <ul className="text-xs text-amber-700/90 space-y-1">
            {transitionWarnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>- {warning}</li>
            ))}
          </ul>
        </div>
      )}
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
          <div className="flex flex-col gap-6">
            {/* Subject Status Selector */}
            <div className="bg-card rounded-2xl p-5 border border-foreground/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                Estado
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusLabels).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleUpdateStatus(key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      subject.status === key 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-foreground/40 border-transparent hover:border-foreground/10'
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>

              {/* Completion Date Inputs (Only for non-pending states) */}
              {subject.status !== 'PENDIENTE' && (
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-foreground/5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-foreground/30 ml-1">Año de Cursada/Final</label>
                    <select 
                      value={completionYear}
                      onChange={(e) => setCompletionYear(e.target.value)}
                      className="!bg-background border border-foreground/5 rounded-xl p-3 text-xs font-bold text-foreground/80 outline-none focus:ring-1 ring-primary appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                        <option key={y} value={y.toString()}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-foreground/30 ml-1">Periodo</label>
                    <select 
                      value={completionPeriod}
                      onChange={(e) => setCompletionPeriod(e.target.value)}
                      className="!bg-background border border-foreground/5 rounded-xl p-3 text-xs font-bold text-foreground/80 outline-none focus:ring-1 ring-primary appearance-none cursor-pointer"
                    >
                      <option value="1">1° Cuatrimestre</option>
                      <option value="2">2° Cuatrimestre</option>
                      <option value="0">Anual / Verano</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-foreground/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!isManualAttemptEditing ? (
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">Recursadas</h4>
                      <span className="text-lg font-bold">{attemptCount}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">Recursadas</h4>
                      <input
                        type="number"
                        min="0"
                        className="w-16 text-center bg-background border border-foreground/10 rounded-lg py-1 px-2 font-bold outline-none focus:ring-1 ring-primary"
                        value={manualAttemptDraft}
                        onChange={(e) => setManualAttemptDraft(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {!isManualAttemptEditing ? (
                  <button
                    onClick={() => {
                      setManualAttemptDraft(attemptCount);
                      setIsManualAttemptEditing(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-foreground/5 text-xs font-bold hover:bg-foreground/10 transition-colors"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const parsed = Number.parseInt(manualAttemptDraft, 10);
                        if (Number.isNaN(parsed) || parsed < 0) {
                          setDetailError('La cantidad de recursadas debe ser un entero mayor o igual a 0');
                          return;
                        }
                        void handleUpdateStatus(subject.status, subject.courseGrade || undefined, parsed);
                      }}
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsManualAttemptEditing(false);
                        setManualAttemptDraft(attemptCount);
                      }}
                      className="px-3 py-2 rounded-lg bg-foreground/5 text-xs font-bold hover:bg-foreground/10"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Grades Management */}
            <div className="bg-card rounded-2xl p-5 border border-foreground/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                Calificaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-xs text-foreground/60 font-medium">Nota de Cursada</span>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="bg-card border-none rounded-lg p-3 text-lg font-bold w-24 outline-none focus:ring-1 ring-primary"
                      placeholder="-"
                      value={courseGrade}
                      onChange={(e) => setCourseGrade(e.target.value)}
                    />
                    <button 
                      onClick={handleSaveCourseGrade}
                      disabled={savingCourseGrade}
                      className="flex-1 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                      {savingCourseGrade ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-xs text-foreground/60 font-medium">Nota Final</span>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="bg-card border-none rounded-lg p-3 text-lg font-bold w-24 outline-none focus:ring-1 ring-primary"
                      placeholder="-"
                      value={finalGrade}
                      onChange={(e) => setFinalGrade(e.target.value)}
                    />
                    <button 
                      onClick={handleRegisterFinal}
                      disabled={savingFinalGrade || !finalGrade}
                      className="flex-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-all uppercase tracking-wider shadow-sm shadow-primary/20 disabled:opacity-50"
                    >
                      {savingFinalGrade ? 'Registrando...' : 'Registrar Final'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Info */}
            <div className="bg-card rounded-2xl p-5 flex items-center gap-4 border border-foreground/5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={24} className="text-primary" />
              </div>
              <div>
                <span className="text-xs text-foreground/60">Carga Horaria Total</span>
                <p className="text-xl font-bold">{subject.careerSubject.subject.hours} horas</p>
              </div>
            </div>
          </div>
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
                    <p className="text-sm">Registrá tus notas parciales acá</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-foreground/5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <RotateCcw size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">¿Reiniciar materia?</h3>
                <p className="text-sm text-foreground/60 mt-2">
                  Se borrarán todas las notas y el estado volverá a <strong>Pendiente</strong>.
                </p>
              </div>
              
              <div className="flex flex-col w-full gap-2 mt-2">
                <button
                  onClick={() => handleResetSubject()}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-red-500/20"
                >
                  Reiniciar Notas y Estado
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-3 bg-transparent text-foreground/40 font-bold hover:text-foreground/60 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};











