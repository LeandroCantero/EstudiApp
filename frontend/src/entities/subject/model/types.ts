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
  completionYear?: number;
  completionPeriod?: number;
  userId: string;
  attemptCount: number;
}

export interface CreateSubjectDto extends Omit<Subject, 'id'> {}
export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {}

export interface UpdateSubjectStatusDto {
  status: SubjectStatus;
  courseGrade?: number;
  completionYear?: number;
  completionPeriod?: number;
}

export interface UpdateFinalDto {
  finalDate?: string;
  grade: number;
  completionYear?: number;
  completionPeriod?: number;
}


export interface AcademicMetrics {
  total: number;
  approved: number;
  progress: number;
  average: number;
}

export interface SubjectNote {
  id: string;
  studentSubjectId: string;
  title?: string;
  content?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title?: string;
  content?: string;
  url?: string;
}

export interface Exam {
  id: string;
  studentSubjectId: string;
  type: string;
  date?: string;
  grade?: number;
  maxGrade: number;
  createdAt: string;
  updatedAt: string;
  eventId?: string;
}

export interface CreateExamDto {
  type: string;
  date?: string;
  grade?: number;
}

export interface UpdateExamDto {
  type?: string;
  date?: string;
  grade?: number;
}
