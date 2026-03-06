import { BadRequestException } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentSubjectsService } from '../student-subjects/student-subjects.service';

describe('Business Rules Logical Tests (RN1, RN2, RN8)', () => {
  let service: StudentSubjectsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      studentSubject: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      careerSubject: {
        findUnique: vi.fn(),
      },
      userCareer: {
        update: vi.fn(),
      }
    };
    service = new StudentSubjectsService(prismaMock);
  });

  describe('RN1: State Transitions', () => {
    it('should allow valid transitions (PENDIENTE -> EN_CURSO)', () => {
      expect(() => (service as any).validateStateTransition(SubjectStatus.PENDIENTE, SubjectStatus.EN_CURSO)).not.toThrow();
    });

    it('should allow valid transitions (EN_CURSO -> REGULARIZADA)', () => {
      expect(() => (service as any).validateStateTransition(SubjectStatus.EN_CURSO, SubjectStatus.REGULARIZADA)).not.toThrow();
    });

    it('should allow transitions from approved to course to fix errors (PROMOCIONADA -> EN_CURSO)', () => {
      expect(() => (service as any).validateStateTransition(SubjectStatus.PROMOCIONADA, SubjectStatus.EN_CURSO)).not.toThrow();
    });

    it('should allow transition to APROBADA if coming from REGULARIZADA', () => {
      expect(() => (service as any).validateStateTransition(SubjectStatus.REGULARIZADA, SubjectStatus.APROBADA)).not.toThrow();
    });

    it('should block invalid transitions (PENDIENTE -> PROMOCIONADA) if no grade', () => {
       // validateStateTransition might allow it, but updateStatus blocks it without grade
       expect(() => (service as any).validateStateTransition(SubjectStatus.PENDIENTE, SubjectStatus.PROMOCIONADA)).toThrow(BadRequestException);
    });
  });

  describe('RN2: Enrollment Prerequisites (REGULARIZADA/PROMOCIONADA/APROBADA required)', () => {
    it('should allow enrollment IF prereq is REGULARIZADA', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: 'ss2',
        status: SubjectStatus.PENDIENTE,
        careerSubjectId: 'cs2',
      } as any);

      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1', subject: { name: 'S1' } }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.REGULARIZADA,
      });
      prismaMock.studentSubject.update.mockResolvedValue({ id: 'ss2', careerSubject: { careerId: 'c1' }, status: SubjectStatus.EN_CURSO });

      await expect(service.updateStatus('u1', 'ss2', { status: SubjectStatus.EN_CURSO })).resolves.toBeDefined();
    });

    it('should block enrollment IF prereq is PENDIENTE', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: 'ss2',
        status: SubjectStatus.PENDIENTE,
        careerSubjectId: 'cs2',
      } as any);

      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1', subject: { name: 'S1' } }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.PENDIENTE,
      });

      await expect(service.updateStatus('u1', 'ss2', { status: SubjectStatus.EN_CURSO })).rejects.toThrow(BadRequestException);
    });
  });

  describe('RN8: Closing Prerequisites (PROMOCIONADA/APROBADA required)', () => {
    it('should allow PROMOCIONADA status IF prereq is PROMOCIONADA', async () => {
      vi.spyOn(service as any, 'validateStateTransition').mockReturnValue(true);
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: 'ss2',
        status: SubjectStatus.EN_CURSO,
        careerSubjectId: 'cs2',
      } as any);

      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1', subject: { name: 'S1' }, code: 'C1' }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.PROMOCIONADA,
      });
      prismaMock.studentSubject.update.mockResolvedValue({ id: 'ss2', status: SubjectStatus.PROMOCIONADA, careerSubject: { careerId: 'c1' } });

      await expect(service.updateStatus('u1', 'ss2', { status: SubjectStatus.PROMOCIONADA, courseGrade: 8 })).resolves.toBeDefined();
    });

    it('should allow APROBADA status IF prereq is APROBADA', async () => {
      vi.spyOn(service as any, 'validateStateTransition').mockReturnValue(true);
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: 'ss2',
        status: SubjectStatus.REGULARIZADA,
        careerSubjectId: 'cs2',
      } as any);

      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1', subject: { name: 'S1' }, code: 'C1' }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.APROBADA,
      });
      prismaMock.studentSubject.update.mockResolvedValue({ id: 'ss2', status: SubjectStatus.APROBADA, careerSubject: { careerId: 'c1' } });

      await expect(service.updateStatus('u1', 'ss2', { status: SubjectStatus.APROBADA })).resolves.toBeDefined();
    });

    it('should block PROMOCIONADA status IF prereq is only REGULARIZADA', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: 'ss2',
        status: SubjectStatus.EN_CURSO,
        careerSubjectId: 'cs2',
      } as any);

      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1', subject: { name: 'S1' }, code: 'C1' }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.REGULARIZADA,
      });

      await expect(service.updateStatus('u1', 'ss2', { status: SubjectStatus.PROMOCIONADA, courseGrade: 8 })).rejects.toThrow(BadRequestException);
    });
  });
});
