import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { careerApi } from '@/entities/career/api/career-api';
import { userApi } from '@/entities/user/api/user-api';
import type { Career } from '@/entities/career/api/career-api';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCareers = async () => {
      try {
        const data = await careerApi.getAll();
        setCareers(data);
      } catch (err) {
        console.error('Error loading careers:', err);
      }
    };
    loadCareers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await userApi.register(email, password, name, selectedCareer);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      navigate('/');
    } catch (err) {
      setError('Error al crear la cuenta. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && name && email && password) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">CursApp</h1>
          <p className="text-foreground/60">Creá tu cuenta</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-xl shadow-primary/5">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold mb-6 text-center">Tus datos</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/70">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full bg-background rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/70">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-background rounded-xl py-3.5 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/70">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background rounded-xl py-3.5 pl-12 pr-12 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  disabled={!name || !email || !password}
                  className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl mt-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  Continuar
                  <ArrowRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-2 text-center">Seleccioná tu carrera</h2>
              <p className="text-sm text-foreground/60 text-center mb-4">
                Esto nos permite organizar tu plan de estudios
              </p>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                {careers.map((career) => (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => setSelectedCareer(career.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedCareer === career.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-background hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{career.name}</p>
                        {career.institute && (
                          <p className="text-xs text-foreground/50">{career.institute}</p>
                        )}
                      </div>
                      {selectedCareer === career.id && (
                        <CheckCircle2 size={20} className="text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border-2 border-foreground/20 text-foreground font-medium hover:bg-foreground/5 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={!selectedCareer || isLoading}
                  className="flex-[2] bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/60">
              ¿Ya tenés cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary font-semibold hover:underline"
              >
                Iniciá sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
