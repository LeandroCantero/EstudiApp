import { Modal } from '@/shared/ui/modal';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSubjectModal = ({ isOpen, onClose }: CreateSubjectModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Materia">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-foreground/60">
          Las materias se cargan automáticamente desde tu carrera.
        </p>
        <p className="text-sm text-foreground/40 mt-2">
          No es necesario agregarlas manualmente.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
};
