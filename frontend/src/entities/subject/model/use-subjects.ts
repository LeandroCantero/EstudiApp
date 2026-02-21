import { useCallback, useEffect, useState } from 'react';
import { Subject, UpdateSubjectStatusDto, UpdateFinalDto } from './types';
import { subjectApi, StudentSubjectResponse } from '../api/subject-api';

interface MappedSubject extends Subject {
  enrollmentYear?: number;
  enrollmentPeriod?: number;
  finalDate?: string;
  finalGrade?: number;
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<MappedSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentCredits, setStudentCredits] = useState(0);

  const mapBackendToFrontend = (data: StudentSubjectResponse[]): MappedSubject[] => {
    return data.map((item) => ({
      id: item.id,
      name: item.subject.name,
      code: item.subject.code,
      status: item.status as Subject['status'],
      grade: item.grade ?? undefined,
      hours: item.subject.hours,
      year: item.subject.year,
      period: item.subject.period,
      userId: '',
      enrollmentYear: item.enrollmentYear ?? undefined,
      enrollmentPeriod: item.enrollmentPeriod ?? undefined,
      finalDate: item.finalDate ?? undefined,
      finalGrade: item.finalGrade ?? undefined,
    }));
  };

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await subjectApi.getMySubjects();
      setSubjects(mapBackendToFrontend(data));
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Error al cargar las materias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = async (id: string, data: UpdateSubjectStatusDto) => {
    setIsLoading(true);
    try {
      await subjectApi.updateStatus(id, data);
      await fetchSubjects();
      return true;
    } catch (err) {
      console.error('Error updating subject status:', err);
      setError('Error al actualizar el estado de la materia');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFinal = async (id: string, data: UpdateFinalDto) => {
    setIsLoading(true);
    try {
      await subjectApi.updateFinal(id, data);
      await fetchSubjects();
      return true;
    } catch (err) {
      console.error('Error updating final exam:', err);
      setError('Error al actualizar el final');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectById = async (id: string): Promise<MappedSubject | null> => {
    try {
      const data = await subjectApi.getById(id);
      return mapBackendToFrontend([data])[0];
    } catch (err) {
      console.error('Error fetching subject:', err);
      return null;
    }
  };

  const updateStudentCredits = (val: number) => {
    setStudentCredits(Math.max(0, val));
  };

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    isLoading,
    error,
    studentCredits,
    updateStudentCredits,
    updateStatus,
    updateFinal,
    getSubjectById,
    refreshData: fetchSubjects,
  };
};
