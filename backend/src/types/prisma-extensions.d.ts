import { PrismaClient } from '@prisma/client';
import { SubjectStatus, User, StudentSubject, Credit, Note, Event } from './prisma.types';

declare module '@prisma/client' {
  export { SubjectStatus };
}

declare module '../prisma.service' {
  interface PrismaService {
    user: {
      findUnique: (args: any) => Promise<User | null>;
      findFirst: (args: any) => Promise<User | null>;
      create: (args: any) => Promise<User>;
      update: (args: any) => Promise<User>;
      updateMany: (args: any) => Promise<any>;
      deleteMany: (args: any) => Promise<any>;
    };
    studentSubject: {
      findMany: (args?: any) => Promise<StudentSubject[]>;
      findFirst: (args: any) => Promise<StudentSubject | null>;
      findUnique: (args: any) => Promise<StudentSubject | null>;
      create: (args: any) => Promise<StudentSubject>;
      update: (args: any) => Promise<StudentSubject>;
      updateMany: (args: any) => Promise<any>;
      deleteMany: (args: any) => Promise<any>;
    };
    credit: {
      findMany: (args?: any) => Promise<Credit[]>;
      create: (args: any) => Promise<Credit>;
      deleteMany: (args: any) => Promise<any>;
    };
    note: {
      findMany: (args?: any) => Promise<Note[]>;
      create: (args: any) => Promise<Note>;
      delete: (args: any) => Promise<Note>;
    };
    event: {
      findMany: (args?: any) => Promise<Event[]>;
      create: (args: any) => Promise<Event>;
      deleteMany: (args: any) => Promise<any>;
    };
  }
}
