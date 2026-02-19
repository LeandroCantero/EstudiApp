export type SubjectStatus = 'PENDIENTE' | 'EN_CURSO' | 'RECUSANDO' | 'REGULARIZADA' | 'APROBADA';

export interface Subject {
  id: string;
  name: string;
  code: string;
  status: SubjectStatus;
  grade?: number;
  hours: number;
  year?: number;
  period?: number;
  userId: string;
}

export interface CreateSubjectDto extends Omit<Subject, 'id'> {}
export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {}

export interface AcademicMetrics {
  total: number;
  approved: number;
  progress: number;
  average: number;
}
