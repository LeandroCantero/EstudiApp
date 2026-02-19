// Extensión temporal de PrismaService para permitir build
// TODO: Eliminar después de ejecutar npx prisma db push

import { PrismaService } from './prisma.service';

declare module './prisma.service' {
  interface PrismaService {
    user: any;
    studentSubject: any;
    credit: any;
    note: any;
    event: any;
  }
}

export {};
