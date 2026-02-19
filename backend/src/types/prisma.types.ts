// Tipos temporales para permitir build sin migración de Prisma
// Estos tipos deben reemplazarse por los generados por Prisma Client después de ejecutar 'npx prisma db push'

export enum SubjectStatus {
  PENDIENTE = 'PENDIENTE',
  EN_CURSO = 'EN_CURSO',
  REGULARIZADA = 'REGULARIZADA',
  PROMOCIONADA = 'PROMOCIONADA',
  DESAPROBADA = 'DESAPROBADA',
  RECURSANDO = 'RECURSANDO',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  careerId: string | null;
  career?: Career;
  subjects?: StudentSubject[];
  credits?: Credit[];
  events?: Event[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentSubject {
  id: string;
  userId: string;
  user?: User;
  careerSubjectId: string;
  careerSubject?: CareerSubject;
  status: SubjectStatus;
  finalGrade: number | null;
  courseGrade: number | null;
  attemptCount: number;
  notes?: Note[];
  events?: Event[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Credit {
  id: string;
  userId: string;
  user?: User;
  category: string;
  activity: string;
  credits: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  studentSubjectId: string;
  studentSubject?: StudentSubject;
  title: string | null;
  content: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  userId: string;
  user?: User;
  studentSubjectId: string | null;
  studentSubject?: StudentSubject;
  title: string;
  type: string;
  date: Date;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Career {
  id: string;
  name: string;
  institute: string | null;
  duration: number | null;
  subjects?: CareerSubject[];
  users?: User[];
}

export interface Subject {
  id: string;
  name: string;
  hours: number;
  careers?: CareerSubject[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerSubject {
  id: string;
  code: string;
  year: number | null;
  period: number | null;
  careerId: string;
  career?: Career;
  subjectId: string;
  subject?: Subject;
  prerequisites?: CareerSubject[];
  requiredBy?: CareerSubject[];
  createdAt: Date;
  updatedAt: Date;
}
