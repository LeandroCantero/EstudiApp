// Mock temporal para permitir build sin migración de Prisma
// Reemplazar después de ejecutar: npx prisma db push

export const SubjectStatus = {
  PENDIENTE: 'PENDIENTE',
  EN_CURSO: 'EN_CURSO',
  REGULARIZADA: 'REGULARIZADA',
  PROMOCIONADA: 'PROMOCIONADA',
  DESAPROBADA: 'DESAPROBADA',
  RECURSANDO: 'RECURSANDO',
} as const;

export type SubjectStatus = typeof SubjectStatus[keyof typeof SubjectStatus];
