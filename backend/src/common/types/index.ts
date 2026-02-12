/**
 * Estados posibles de una materia según el régimen de la UNAHUR.
 */
export enum SubjectStatus {
  PENDIENTE = 'PENDIENTE',
  EN_CURSO = 'EN_CURSO',
  REGULARIZADA = 'REGULARIZADA',
  PROMOCIONADA = 'PROMOCIONADA',
  DESAPROBADA = 'DESAPROBADA',
  RECURSANDO = 'RECURSANDO'
}

/**
 * Interfaz base para una Materia.
 */
export interface Subject {
  id: string;
  name: string;
  code: string;
  status: SubjectStatus;
  grade?: number;
  year: number;
  period: number; // 1 o 2 cuatrimestre
  credits: number;
  isExtracurricular: boolean;
}

/**
 * Estructura de respuesta estandarizada para toda la aplicación.
 */
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

/**
 * Tipos para la proyección de graduación.
 */
export interface GraduationProjection {
  estimatedDate: string;
  remainingSubjects: number;
  averageSubjectsPerPeriod: number;
}
