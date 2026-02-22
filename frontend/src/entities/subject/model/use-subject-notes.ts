import { useCallback, useEffect, useState } from 'react';
import { subjectApi } from '../api/subject-api';
import { CreateNoteDto, SubjectNote } from './types';

export const useSubjectNotes = (studentSubjectId: string) => {
  const [notes, setNotes] = useState<SubjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!studentSubjectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await subjectApi.getNotes(studentSubjectId);
      setNotes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las notas');
    } finally {
      setIsLoading(false);
    }
  }, [studentSubjectId]);

  const addNote = async (dto: CreateNoteDto) => {
    setIsLoading(true);
    try {
      const newNote = await subjectApi.createNote(studentSubjectId, dto);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await subjectApi.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar la nota');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    refresh: fetchNotes,
    addNote,
    deleteNote,
  };
};
