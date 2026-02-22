import { useCallback, useEffect, useState } from 'react';
import { examApi } from '../api/exam-api';
import { CreateExamDto, Exam, UpdateExamDto } from './types';

export const useExams = (studentSubjectId: string) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    if (!studentSubjectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await examApi.getBySubject(studentSubjectId);
      setExams(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los exámenes');
    } finally {
      setIsLoading(false);
    }
  }, [studentSubjectId]);

  const addExam = async (data: CreateExamDto) => {
    setIsLoading(true);
    try {
      if (!studentSubjectId) return;
      await examApi.create(studentSubjectId, data);
      await fetchExams();
    } catch (err) {
      console.error('Error adding exam:', err);
      setError('Error al agregar el examen');
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = async (id: string, data: UpdateExamDto) => {
    setIsLoading(true);
    try {
      await examApi.update(id, data);
      await fetchExams();
    } catch (err) {
      console.error('Error updating exam:', err);
      setError('Error al actualizar el examen');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExam = async (id: string) => {
    setIsLoading(true);
    try {
      await examApi.delete(id);
      await fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('Error al eliminar el examen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { 
    exams, 
    isLoading, 
    error, 
    addExam, 
    updateExam,
    deleteExam, 
    refreshExams: fetchExams 
  };
};
