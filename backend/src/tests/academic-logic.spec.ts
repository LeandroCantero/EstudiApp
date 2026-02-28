import { SubjectStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamsService } from '../exams/exams.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { UsersService } from '../users/users.service';

describe('Academic Logic Tests', () => {
  let usersService: UsersService;
  let recommendationsService: RecommendationsService;
  let examsService: ExamsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      career: {
        findUnique: vi.fn(),
      },
      studentSubject: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      careerSubject: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      credit: {
        findMany: vi.fn(),
      },
      exam: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      event: {
        create: vi.fn(),
      }
    };
    usersService = new UsersService(prismaMock);
    recommendationsService = new RecommendationsService(prismaMock);
    examsService = new ExamsService(prismaMock);
  });

  describe('CP-06: Dashboard Metrics (US-01)', () => {
    it('should calculate progress and average correctly', async () => {
      const mockUser = {
        name: 'Test User',
        userCareers: [{
          careerId: 'c1',
          career: { name: 'Test Career', subjects: [{}, {}, {}, {}] } // 4 total
        }],
        subjects: [
          { status: SubjectStatus.PROMOCIONADA, finalGrade: 8, careerSubject: { careerId: 'c1', subject: { name: 'S1' }, code: 'C1' } },
          { status: SubjectStatus.REGULARIZADA, courseGrade: 7, careerSubject: { careerId: 'c1', subject: { name: 'S2' }, code: 'C2' } },
        ],
        credits: []
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      // Mock graduation for getDashboardMetrics
      vi.spyOn(usersService, 'getEstimatedGraduation').mockResolvedValue({
        estimatedDate: new Date(),
        remainingSubjects: 2,
        averageProgress: 1
      });

      const metrics = await usersService.getDashboardMetrics('u1');
      
      // Progress: (1 PROM + 0.5 REG) / 4 = 1.5 / 4 = 0.375 -> 37.5%
      expect(metrics.progressPercentage).toBe(37.5);
      // Average: (8 + 7) / 2 = 7.5
      expect(metrics.averageGrade).toBe(7.5);
    });
  });

  describe('CP-07: Recommendations (US-03)', () => {
    it('should calculate priority score based on transitive impact and seasonality', async () => {
      const mockEligible = [
        { 
          careerSubjectId: 'cs1', 
          careerSubject: { id: 'cs1', period: 1, subject: { hours: 64 }, requiredBy: [] } 
        }
      ];
      
      prismaMock.studentSubject.findMany.mockResolvedValue(mockEligible);
      // Mock canTakeSubject
      vi.spyOn(recommendationsService as any, 'canTakeSubject').mockResolvedValue(true);
      // Mock calculateTransitiveImpact: cs1 unlocks 3 subjects
      vi.spyOn(recommendationsService as any, 'calculateTransitiveImpact').mockResolvedValue(3);

      const recs = await recommendationsService.getRecommendations('u1');
      
      expect(recs[0].transitiveImpact).toBe(3);
      // Score = (Impact * 2) + (MatchesSeason ? 10 : 0)
      // Assuming current month is Mar-Jul (Semester 1) or matches cs1 period
      const currentMonth = new Date().getMonth();
      const currentSemester = currentMonth < 7 ? 1 : 2;
      const expectedScore = (3 * 2) + (currentSemester === 1 ? 10 : 0);
      
      expect(recs[0].priorityScore).toBe(expectedScore);
    });
  });

  describe('CP-08: Graduation Projection (US-06)', () => {
    it('should estimate date based on velocity and critical path', async () => {
      const mockUser = {
        userCareers: [{
          careerId: 'c1',
          createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // 1 year ago
          career: { subjects: [{}, {}, {}, {}] }
        }],
        subjects: [
          { status: SubjectStatus.PROMOCIONADA, careerSubject: { careerId: 'c1', period: 1 } },
          { status: SubjectStatus.PROMOCIONADA, careerSubject: { careerId: 'c1', period: 2 } },
          { status: SubjectStatus.PENDIENTE, careerSubject: { careerId: 'c1', period: 1, id: 'cs3' } },
          { status: SubjectStatus.PENDIENTE, careerSubject: { careerId: 'c1', period: 2, id: 'cs4' } },
        ]
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      // Depth of 2 terms
      vi.spyOn(usersService as any, 'calculateCriticalPathDepth').mockResolvedValue(2);

      const result = await usersService.getEstimatedGraduation('u1');
      
      expect(result.remainingSubjects).toBe(2);
      // Velocity: 2 subjects / 2 semesters = 1 sub/sem (clamped to 2 min in code)
      expect(result.averageProgress).toBe(2);
      // Remaining semesters: max(2/2, 2) = 2
      // Date should be roughly 12 months from now (2 * 6)
      const monthsDiff = (result.estimatedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      expect(Math.round(monthsDiff)).toBe(12);
    });
  });

  describe('CP-05: Exams and Attempts (US-09)', () => {
    it('should create exam and record grade', async () => {
      const mockSS = {
        id: 'ss1',
        userId: 'u1',
        careerSubject: { subject: { name: 'Math' } }
      };
      prismaMock.studentSubject.findUnique.mockResolvedValue(mockSS);
      prismaMock.event.create.mockResolvedValue({ id: 'e1' });

      await examsService.create('u1', 'ss1', { type: 'Final', grade: 2 });
      
      expect(prismaMock.exam.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          grade: 2,
          type: 'Final'
        })
      });
    });
  });
});
