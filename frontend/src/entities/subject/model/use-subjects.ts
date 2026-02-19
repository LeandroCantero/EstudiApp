import { Career } from '@/entities/career/api/career-api';
import { User } from '@/entities/user/api/user-api';
import { useCallback, useEffect, useState } from 'react';
import { AcademicMetrics, CreateSubjectDto, Subject } from './types';

const GUEST_DATA_KEY = 'cursapp_guest_data';

interface GuestData {
  subjects: Subject[];
  career: Career | null;
  name: string;
  studentCredits: number; // For extracurricular credits (target 35)
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [metrics, setMetrics] = useState<AcademicMetrics | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [studentCredits, setStudentCredits] = useState(0);
  
  // Always true now, effectively
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Calculate metrics locally
  const calculateMetrics = (subs: Subject[]): AcademicMetrics => {
    const total = subs.length;
    const approved = subs.filter(s => s.status === 'APROBADA').length;
    const progress = total > 0 ? (approved / total) * 100 : 0;
    
    const approvedSubjects = subs.filter(s => s.status === 'APROBADA' && s.grade);
    const sumGrades = approvedSubjects.reduce((acc, curr) => acc + (curr.grade || 0), 0);
    const average = approvedSubjects.length > 0 ? sumGrades / approvedSubjects.length : 0;

    return { total, approved, progress, average };
  };

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const raw = localStorage.getItem(GUEST_DATA_KEY);
      if (raw) {
        const data: GuestData = JSON.parse(raw);
        setSubjects(data.subjects);
        setCareer(data.career);
        setStudentCredits(data.studentCredits || 0);
        // Mock user object for compatibility
        setUser({ id: 'guest', email: '', name: data.name, career: data.career, createdAt: new Date().toISOString() });
        setMetrics(calculateMetrics(data.subjects));
      } else {
        // Init empty
        setSubjects([]);
        setStudentCredits(0);
        setMetrics(calculateMetrics([]));
      }
      setIsGuest(true);
    } catch (err) {
      console.error('Error loading local data', err);
      setError('Error cargando datos locales');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = (newSubjects: Subject[], newCareer: Career | null, newName: string, newCredits: number) => {
    const data: GuestData = { 
      subjects: newSubjects, 
      career: newCareer, 
      name: newName,
      studentCredits: newCredits
    };
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    
    setSubjects(newSubjects);
    setCareer(newCareer);
    setStudentCredits(newCredits);
    setMetrics(calculateMetrics(newSubjects));
    setUser({ id: 'guest', email: '', name: newName, career: newCareer, createdAt: new Date().toISOString() });
  };

  const updateStudentCredits = (val: number) => {
    saveData(subjects, career, user?.name || 'Invitado', val);
  };

  const createSubject = useCallback(async (data: CreateSubjectDto) => {
    setIsLoading(true);
    try {
      // Simulate async delay slightly for UX
      await new Promise(r => setTimeout(r, 300));

      const newSubject: Subject = {
        ...data,
        id: crypto.randomUUID(),
        userId: 'guest',
      };
      
      const newSubjects = [...subjects, newSubject];
      saveData(newSubjects, career, user?.name || 'Invitado', studentCredits);
      return true;
    } catch (err) {
      setError('Error al guardar materia localmente');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subjects, career, user, studentCredits]);

  const updateCareerGuest = useCallback((newCareer: Career, userName: string) => {
    saveData([], newCareer, userName, 0); // Reset everything on career change
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compatibility dummies
  const refreshData = loadData;

  return {
    subjects,
    metrics,
    suggestions,
    user,
    career,
    studentCredits,
    isLoading,
    error,
    isGuest,
    createSubject,
    updateCareerGuest,
    updateStudentCredits,
    refreshData,
  };
};
