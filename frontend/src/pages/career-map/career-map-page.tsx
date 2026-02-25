import { StudentSubjectResponse, subjectApi } from '@/entities/subject/api/subject-api';
import { Network, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MarkerType,
    MiniMap,
    Node,
    useEdgesState,
    useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { QuarterHeaderNode } from './quarter-header-node';
import { SubjectNode } from './subject-node';

const nodeTypes = {
  subject: SubjectNode,
  quarterHeader: QuarterHeaderNode,
};

const PERIOD_LABELS: Record<number, string> = {
  0: 'Anual',
  1: '1° Cuatrimestre',
  2: '2° Cuatrimestre',
};

const COL_WIDTH = 240;
const NODE_HEIGHT = 100;
const HEADER_HEIGHT = 70;
const H_GAP = 30;
const V_GAP = 14;

/** Calculates a unique, ordered quarter key from year+period */
const getQuarterKey = (year: number | null, period: number | null) =>
  `${year ?? 0}-${period ?? 1}`;

export const CareerMapPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalSubjects, setOriginalSubjects] = useState<StudentSubjectResponse[]>([]);
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, string>>({});
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  const calculateRecommendations = useCallback(
    (subjects: StudentSubjectResponse[], currentSimulated: Record<string, string>) => {
      return subjects
        .filter((s) => {
          const status = currentSimulated[s.careerSubject.id] || s.status;
          if (status !== 'PENDIENTE') return false;
          return s.careerSubject.prerequisites.every((pre) => {
            const preStatus =
              currentSimulated[pre.id] ||
              subjects.find((sub) => sub.careerSubject.id === pre.id)?.status;
            return preStatus === 'PROMOCIONADA';
          });
        })
        .map((s) => s.careerSubject.id);
    },
    [],
  );

  const buildGraph = useCallback(
    (
      subjects: StudentSubjectResponse[],
      simulated: Record<string, string>,
      showRecs: boolean,
    ) => {
      const currentRecs = calculateRecommendations(subjects, simulated);

      // --- Impact map ---
      const impactMap = new Map<string, number>();
      subjects.forEach((s) => {
        const calculateImpact = (id: string, visited = new Set<string>()): number => {
          if (visited.has(id)) return 0;
          visited.add(id);
          const dependents = subjects.filter((sub) =>
            sub.careerSubject.prerequisites.some((p) => p.id === id),
          );
          return (
            dependents.length +
            dependents.reduce((acc, dep) => acc + calculateImpact(dep.careerSubject.id, visited), 0)
          );
        };
        impactMap.set(s.careerSubject.id, calculateImpact(s.careerSubject.id));
      });

      // --- Group by quarter (year + period) ---
      const quarterMap = new Map<string, StudentSubjectResponse[]>();
      subjects.forEach((s) => {
        const key = getQuarterKey(s.careerSubject.year, s.careerSubject.period);
        if (!quarterMap.has(key)) quarterMap.set(key, []);
        quarterMap.get(key)!.push(s);
      });

      // Sort quarters chronologically
      const sortedQuarters = [...quarterMap.keys()].sort((a, b) => {
        const [ay, ap] = a.split('-').map(Number);
        const [by, bp] = b.split('-').map(Number);
        return ay !== by ? ay - by : ap - bp;
      });

      // --- Build nodes ---
      const newNodes: Node[] = [];

      sortedQuarters.forEach((quarterKey, colIndex) => {
        const colSubjects = quarterMap.get(quarterKey)!;
        const [year, period] = quarterKey.split('-').map(Number);
        const x = colIndex * (COL_WIDTH + H_GAP);

        // Sort subjects within column by impact descending
        const sortedInCol = [...colSubjects].sort(
          (a, b) =>
            (impactMap.get(b.careerSubject.id) || 0) - (impactMap.get(a.careerSubject.id) || 0),
        );

        // Header node for this quarter
        const headerLabel = PERIOD_LABELS[period] ?? `${period}° Cuatrimestre`;
        const headerSubLabel = year > 0 ? `Año ${year}` : '';
        newNodes.push({
          id: `header-${quarterKey}`,
          type: 'quarterHeader',
          position: { x, y: 0 },
          data: { label: headerLabel, subLabel: headerSubLabel },
          selectable: false,
          draggable: false,
        });

        // Subject nodes in this column
        sortedInCol.forEach((s, rowIndex) => {
          const y = HEADER_HEIGHT + rowIndex * (NODE_HEIGHT + V_GAP);
          const status = simulated[s.careerSubject.id] || s.status;
          const isRecommended = showRecs && currentRecs.includes(s.careerSubject.id);

          let finalStatus = status;
          if (status === 'PENDIENTE') {
            const hasUnmetPrereqs = s.careerSubject.prerequisites.some((pre) => {
              const prereqStatus =
                simulated[pre.id] ||
                subjects.find((sub) => sub.careerSubject.id === pre.id)?.status;
              return prereqStatus !== 'PROMOCIONADA' && prereqStatus !== 'REGULARIZADA';
            });
            if (hasUnmetPrereqs) finalStatus = 'BLOQUEADA';
          }

          newNodes.push({
            id: s.careerSubject.id,
            type: 'subject',
            position: { x, y },
            data: {
              name: s.careerSubject.subject.name,
              code: s.careerSubject.code,
              status: finalStatus,
              impact: impactMap.get(s.careerSubject.id) || 0,
              isAnnual: s.careerSubject.period === 0,
              isSimulated: !!simulated[s.careerSubject.id],
              isRecommended,
            },
          });
        });
      });

      setNodes(newNodes);

      // --- Build edges ---
      const newEdges = subjects.flatMap((s) =>
        s.careerSubject.prerequisites.map((p) => {
          const isTargetRecommended = showRecs && currentRecs.includes(s.careerSubject.id);
          const srcStatus =
            simulated[p.id] || subjects.find((sub) => sub.careerSubject.id === p.id)?.status;
          const isOptimalPath =
            isTargetRecommended && (srcStatus === 'PROMOCIONADA');

          return {
            id: `e-${p.id}-${s.careerSubject.id}`,
            source: p.id,
            target: s.careerSubject.id,
            animated: isOptimalPath,
            style: {
              stroke: isOptimalPath ? '#fa8112' : 'rgba(100,100,120,0.25)',
              strokeWidth: isOptimalPath ? 2.5 : 1.5,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isOptimalPath ? '#fa8112' : 'rgba(100,100,120,0.35)',
            },
          };
        }),
      );

      setEdges(newEdges);
    },
    [setNodes, setEdges, calculateRecommendations],
  );

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const subjects = await subjectApi.getMySubjects();
        setOriginalSubjects(subjects);
        buildGraph(subjects, {}, true);
      } catch (err) {
        console.error('Error fetching data for map:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [buildGraph]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.type === 'quarterHeader') return;
    const subjectId = node.id;
    const currentSimStatus = simulatedStatuses[subjectId];
    const originalSubject = originalSubjects.find((s) => s.careerSubject.id === subjectId);
    if (!originalSubject) return;

    if (node.data.status === 'BLOQUEADA' && !currentSimStatus) return;

    setSimulatedStatuses((prev) => {
      const next = { ...prev };
      if (!!currentSimStatus) {
        delete next[subjectId];
      } else {
        next[subjectId] = originalSubject.status === 'PROMOCIONADA' ? 'PENDIENTE' : 'PROMOCIONADA';
      }
      buildGraph(originalSubjects, next, showRecommendations);
      return next;
    });
  };

  const toggleRecommendations = () => {
    const newVal = !showRecommendations;
    setShowRecommendations(newVal);
    buildGraph(originalSubjects, simulatedStatuses, newVal);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* ── Header overlay ── */}
      <header className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        {/* Title */}
        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md p-3 px-5 rounded-2xl border border-border/50 shadow-xl pointer-events-auto">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Network size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none mb-1">Mapa de Carrera</h1>
            <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-wider">
              Simulador de Trayectoria
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecommendations}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border-none outline-none shadow-xl ${
                showRecommendations
                  ? 'bg-primary text-primary-foreground shadow-primary/20'
                  : 'bg-card/80 backdrop-blur-md text-foreground/40 hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              <Sparkles size={14} />
              {showRecommendations ? 'RECOMENDACIONES ACTIVAS' : 'MOSTRAR RECOMENDACIONES'}
            </button>

            {Object.keys(simulatedStatuses).length > 0 && (
              <button
                onClick={() => {
                  setSimulatedStatuses({});
                  buildGraph(originalSubjects, {}, showRecommendations);
                }}
                className="text-[10px] font-black text-destructive bg-destructive/10 backdrop-blur-md px-4 py-2.5 rounded-xl hover:bg-destructive hover:text-white transition-all border border-destructive/20 shadow-xl shadow-destructive/10 outline-none"
              >
                LIMPIAR ({Object.keys(simulatedStatuses).length})
              </button>
            )}
          </div>

          {/* Legend */}
          <div
            className={`bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
              showLegend
                ? 'p-4 w-[200px] gap-3'
                : 'p-2 w-10 h-10 items-center justify-center cursor-pointer hover:bg-card hover:scale-105'
            }`}
            onClick={() => !showLegend && setShowLegend(true)}
          >
            {showLegend ? (
              <>
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <p className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">
                    Leyenda
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLegend(false);
                    }}
                    className="p-1 hover:bg-foreground/5 rounded-md transition-colors"
                  >
                    <X size={12} className="text-foreground/40" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-green-600" />
                    <span className="text-[9px] font-bold">APROBADA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-blue-600" />
                    <span className="text-[9px] font-bold">REGULARIZADA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-primary" />
                    <span className="text-[9px] font-bold">CURSANDO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-card border border-foreground/10" />
                    <span className="text-[9px] font-bold text-foreground/60">PENDIENTE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-muted/50 border border-foreground/5" />
                    <span className="text-[9px] font-bold text-foreground/30">BLOQUEADA</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pt-2 border-t border-border/20">
                    <div className="w-2.5 h-2.5 rounded bg-amber-400" />
                    <span className="text-[9px] font-bold text-amber-500">RECOMENDADA</span>
                  </div>
                </div>
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center text-foreground/40"
                title="Ver leyenda"
              >
                <Network size={16} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── ReactFlow canvas ── */}
      <div className="flex-1 bg-background relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          maxZoom={1.8}
          minZoom={0.08}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background color="currentColor" className="text-foreground/5" gap={24} />
          <Controls showInteractive={false} className="mb-24 md:mb-0" />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'quarterHeader') return 'transparent';
              const status = n.data?.status;
              if (status === 'PROMOCIONADA') return '#16a34a';
              if (status === 'REGULARIZADA') return '#2563eb';
              if (status === 'EN_CURSO' || status === 'RECURSANDO') return '#fa8112';
              if (status === 'BLOQUEADA') return '#6b7280';
              return '#94a3b8';
            }}
            maskColor="rgba(var(--background), 0.7)"
            className="!bg-card/80 !backdrop-blur-md !border-border/50 !rounded-xl !shadow-2xl !m-6 overflow-hidden"
            style={{ height: 100, width: 150 }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
