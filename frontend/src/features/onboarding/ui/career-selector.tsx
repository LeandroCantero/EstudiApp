import { Career, careerApi } from '@/entities/career/api/career-api';
import { useSubjects } from '@/entities/subject/model/use-subjects';
import { Modal } from '@/shared/ui/modal';
import { useEffect, useState } from 'react';

interface CareerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CareerSelector = ({ isOpen, onClose }: CareerSelectorProps) => {
  const { updateCareerGuest } = useSubjects();
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    careerApi.getAll()
      .then(setCareers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelect = (career: Career) => {
    // For prototype, we just ask for a name or default to 'Invitado'
    // in a real app we might ask for name here too
    updateCareerGuest(career, 'Invitado');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecciona tu Carrera">
      <div className="flex flex-col gap-4">
        {isLoading ? (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-2">
            {careers.map((career) => (
                <button
                key={career.id}
                onClick={() => handleSelect(career)}
                className="text-left p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                <div className="font-semibold text-primary">{career.name}</div>
                <div className="text-xs text-foreground/60">{career.institute}</div>
                </button>
            ))}
            </div>
        )}
      </div>
    </Modal>
  );
};
