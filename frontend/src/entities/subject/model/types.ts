export type SubjectStatus = 'PENDIENTE' | 'EN_CURSO' | 'RECURSANDO' | 'REGULARIZADA' | 'PROMOCIONADA' | 'DESAPROBADA';

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

export interface UpdateSubjectStatusDto {
  status: SubjectStatus;
  grade?: number;
  enrollmentYear?: number;
  enrollmentPeriod?: number;
}

export interface UpdateFinalDto {
  finalDate: string;
  finalGrade: number;
}

export interface AcademicMetrics {
  total: number;
  approved: number;
  progress: number;
  average: number;
}
