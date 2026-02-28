import { SubjectStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecommendationsService } from '../recommendations/recommendations.service';

describe('Recommendations Service - Logic Refinement (RN5)', () => {
  let service: RecommendationsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      studentSubject: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      careerSubject: {
        findUnique: vi.fn(),
      },
    };
    service = new RecommendationsService(prismaMock);
  });

  describe('Strict Prerequisite Check', () => {
    it('should NOT allow a subject if prereq is REGULARIZADA but has NO final grade', async () => {
      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1' }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.REGULARIZADA,
        finalGrade: null,
      });

      const canTake = await (service as any).canTakeSubject('u1', 'cs2');
      expect(canTake).toBe(false);
    });

    it('should allow a subject if prereq is PROMOCIONADA', async () => {
      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1' }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.PROMOCIONADA,
        finalGrade: null,
      });

      const canTake = await (service as any).canTakeSubject('u1', 'cs2');
      expect(canTake).toBe(true);
    });

    it('should allow a subject if prereq is REGULARIZADA and HAS a final grade >= 4', async () => {
      prismaMock.careerSubject.findUnique.mockResolvedValue({
        id: 'cs2',
        prerequisites: [{ id: 'cs1' }],
      });
      prismaMock.studentSubject.findFirst.mockResolvedValue({
        status: SubjectStatus.REGULARIZADA,
        finalGrade: 7,
      });

      const canTake = await (service as any).canTakeSubject('u1', 'cs2');
      expect(canTake).toBe(true);
    });
  });

  describe('Priority Scoring', () => {
    it('should prioritize Year 1 subjects over Year 2 (Proximity)', async () => {
      const eligibleSubjects = [
        {
          careerSubjectId: 'cs_y2',
          careerSubject: { id: 'cs_y2', year: 2, period: 1, subject: { hours: 64 }, requiredBy: [] },
        },
        {
          careerSubjectId: 'cs_y1',
          careerSubject: { id: 'cs_y1', year: 1, period: 1, subject: { hours: 64 }, requiredBy: [] },
        },
      ];

      prismaMock.studentSubject.findMany.mockResolvedValue(eligibleSubjects);
      prismaMock.careerSubject.findUnique.mockResolvedValue({ prerequisites: [] }); // Simulating canTake = true
      
      // Mock transitive impact
      vi.spyOn(service as any, 'calculateTransitiveImpact').mockResolvedValue(0);

      const results = await service.getRecommendations('u1');
      
      expect(results[0].careerSubjectId).toBe('cs_y1');
      expect(results[0].priorityScore).toBeGreaterThan(results[1].priorityScore);
    });

    it('should prioritize Period 1 over Period 2 within the same year', async () => {
      const eligibleSubjects = [
        {
          careerSubjectId: 'cs_p2',
          careerSubject: { id: 'cs_p2', year: 1, period: 2, subject: { hours: 64 }, requiredBy: [] },
        },
        {
          careerSubjectId: 'cs_p1',
          careerSubject: { id: 'cs_p1', year: 1, period: 1, subject: { hours: 64 }, requiredBy: [] },
        },
      ];

      prismaMock.studentSubject.findMany.mockResolvedValue(eligibleSubjects);
      prismaMock.careerSubject.findUnique.mockResolvedValue({ prerequisites: [] });
      vi.spyOn(service as any, 'calculateTransitiveImpact').mockResolvedValue(0);

      const results = await service.getRecommendations('u1');
      
      expect(results[0].careerSubjectId).toBe('cs_p1');
      expect(results[0].priorityScore).toBeGreaterThan(results[1].priorityScore);
    });
  });
});
