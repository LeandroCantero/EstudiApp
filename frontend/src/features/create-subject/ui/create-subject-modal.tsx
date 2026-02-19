import { TemplateSubject, careerApi } from '@/entities/career/api/career-api';
import { CreateSubjectDto } from '@/entities/subject/model/types';
import { useSubjects } from '@/entities/subject/model/use-subjects';
import { Modal } from '@/shared/ui/modal';
import { useEffect, useState } from 'react';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSubjectModal = ({ isOpen, onClose }: CreateSubjectModalProps) => {
  const { createSubject, career } = useSubjects();
  const [formData, setFormData] = useState<CreateSubjectDto>({
    name: '',
    code: '',
    status: 'PENDIENTE',
    hours: 0,
    // userId is handled by the hook now
    userId: '', 
  });
  const [subjects, setSubjects] = useState<TemplateSubject[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (isOpen && career?.id) {
      setLoadingSubjects(true);
      careerApi.getById(career.id)
        .then(c => {
          if (c.subjects) setSubjects(c.subjects);
        })
        .catch(console.error)
        .finally(() => setLoadingSubjects(false));
    }
  }, [isOpen, career]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    
    const template = subjects.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.subject.name,
        code: template.code,
        hours: template.subject.hours,
        year: template.year || prev.year,
        period: template.period || prev.period,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' || name === 'year' || name === 'period' || name === 'grade' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await createSubject(formData);
    setIsSubmitting(false);
    if (success) {
      onClose();
      // Reset form
      setFormData({
        name: '',
        code: '',
        status: 'PENDIENTE',
        hours: 0,
        userId: '',
      });
      setSelectedTemplateId('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Materia">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Template Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">Materia</label>
          <select
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            disabled={loadingSubjects}
            className="w-full bg-background border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="">{loadingSubjects ? 'Cargando materias...' : 'Selecciona una materia...'}</option>
            {subjects.map(t => (
              <option key={t.id} value={t.id}>
                {t.year}° Año - {t.code}: {t.subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Read-only fields populated by template */}
        <div className="grid grid-cols-2 gap-4 opacity-75">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              disabled
              value={formData.name}
              className="w-full bg-foreground/5 border border-border rounded-lg p-2.5 outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <input
              type="text"
              name="code"
              disabled
              value={formData.code}
              className="w-full bg-foreground/5 border border-border rounded-lg p-2.5 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="REGULARIZADA">Regularizada</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECUSANDO">Recursando</option>
          </select>
        </div>

        {formData.status === 'APROBADA' && (
          <div>
            <label className="block text-sm font-medium mb-1">Nota Final</label>
            <input
              type="number"
              name="grade"
              min="1"
              max="10"
              value={formData.grade || ''}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        )}

        {/* Hidden internal fields but useful to verify */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Año</label>
            <input
              type="number"
              name="year"
              disabled
              value={formData.year || ''}
              className="w-full bg-foreground/5 border border-border rounded-lg p-2.5 outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cuatrimestre</label>
            <input
              type="number"
              name="period"
              disabled
              value={formData.period || ''}
              className="w-full bg-foreground/5 border border-border rounded-lg p-2.5 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedTemplateId}
          className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Materia'}
        </button>
      </form>
    </Modal>
  );
};
