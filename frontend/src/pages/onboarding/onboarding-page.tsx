import { Career, careerApi } from '@/entities/career/api/career-api';
import { userApi } from '@/entities/user/api/user-api';
import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const OnboardingPage = ({ onFinish }: { onFinish?: () => void }) => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await careerApi.getAll();
        setCareers(data);
      } catch (error) {
        console.error('Error fetching careers:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchCareers();
  }, []);

  const handleFinish = async () => {
    if (!selectedCareer) return;
    
    setIsLoading(true);
    try {
      await userApi.updateMe({ career: selectedCareer });
      
      // Notificar al padre para que refresque los datos del usuario
      if (onFinish) {
        await onFinish();
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error updating career:', error);
      alert('Error al guardar la carrera. Reintentá en un momento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">¡Bienvenido a CursApp!</h1>
          <p className="text-muted-foreground text-lg">
            Para empezar, seleccioná tu carrera. Esto nos permite organizar tu plan de estudios.
          </p>
        </header>

        <div className="grid gap-3">
          {isFetching ? (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full" />
              <p>Cargando carreras...</p>
            </div>
          ) : (
            careers.map((career) => (
              <button
                key={career.id}
                type="button"
                onClick={() => setSelectedCareer(career.id)}
                className={`
                  flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left
                  ${selectedCareer === career.id 
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                    : 'border-foreground/5 bg-card hover:border-primary/30'}
                `}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{career.name}</span>
                  {career.institute && (
                    <span className="text-sm text-muted-foreground">{career.institute}</span>
                  )}
                </div>
                {selectedCareer === career.id && (
                  <CheckCircle2 className="text-primary animate-in zoom-in duration-300" size={24} />
                )}
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!selectedCareer || isLoading}
          className={`
            w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl transition-all
            ${selectedCareer 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'}
          `}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Empezar mi carrera
              <ArrowRight size={24} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
