import { describe, expect, it } from 'vitest';

// Simulating the behavior of calculateRecommendations and buildGraph from CareerMapPage
const calculateRecommendations = (subjects: any[], currentSimulated: Record<string, string>) => {
  return subjects
    .filter((s) => {
      const status = currentSimulated[s.careerSubject.id] || s.status;
      if (status !== 'PENDIENTE') return false;
      return s.careerSubject.prerequisites.every((pre: any) => {
        const preStatus =
          currentSimulated[pre.id] ||
          subjects.find((sub) => sub.careerSubject.id === pre.id)?.status;
        return preStatus === 'PROMOCIONADA';
      });
    })
    .map((s: any) => s.careerSubject.id);
};

describe('CP-11: Simulation Logic (US-08)', () => {
  const mockSubjects = [
    {
      status: 'PENDIENTE',
      careerSubject: {
        id: 'math1',
        subject: { name: 'Math 1' },
        prerequisites: []
      }
    },
    {
      status: 'PENDIENTE',
      careerSubject: {
        id: 'math2',
        subject: { name: 'Math 2' },
        prerequisites: [{ id: 'math1' }]
      }
    }
  ];

  it('should not recommend Math 2 when Math 1 is PENDING', () => {
    const simulated = {};
    const recs = calculateRecommendations(mockSubjects, simulated);
    expect(recs).toContain('math1');
    expect(recs).not.toContain('math2');
  });

  it('should recommend Math 2 when Math 1 is simulated as PROMOCIONADA', () => {
    const simulated = { 'math1': 'PROMOCIONADA' };
    const recs = calculateRecommendations(mockSubjects, simulated);
    
    // math1 is no longer PENDING (status is PROMOCIONADA in simulated)
    expect(recs).not.toContain('math1');
    // math2 is now eligible because its prereq math1 is simulated PROMOCIONADA
    expect(recs).toContain('math2');
  });

  it('should correctly status blocked subjects in simulation context', () => {
    // Logic equivalent to the buildGraph status calculation
    const getFinalStatus = (s: any, simulated: Record<string, string>) => {
      const status = simulated[s.careerSubject.id] || s.status;
      if (status === 'PENDIENTE') {
        const hasUnmetPrereqs = s.careerSubject.prerequisites.some((pre: any) => {
          const prereqStatus =
            simulated[pre.id] ||
            mockSubjects.find((sub) => sub.careerSubject.id === pre.id)?.status;
          return prereqStatus !== 'PROMOCIONADA' && prereqStatus !== 'REGULARIZADA';
        });
        if (hasUnmetPrereqs) return 'BLOQUEADA';
      }
      return status;
    };

    expect(getFinalStatus(mockSubjects[1], {})).toBe('BLOQUEADA');
    expect(getFinalStatus(mockSubjects[1], { 'math1': 'REGULARIZADA' })).toBe('PENDIENTE');
    expect(getFinalStatus(mockSubjects[1], { 'math1': 'PROMOCIONADA' })).toBe('PENDIENTE');
  });
});
