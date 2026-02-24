import { StudentSubjectResponse, subjectApi } from '@/entities/subject/api/subject-api';
import { apiClient } from '@/shared/api/base';
import { Network, Sparkles } from 'lucide-react';
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
import { SubjectNode } from './subject-node';

const nodeTypes = {
  subject: SubjectNode,
};

interface Recommendation {
  careerSubject: { id: string };
  priorityScore: number;
}

export const CareerMapPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalSubjects, setOriginalSubjects] = useState<StudentSubjectResponse[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, string>>({});
  const [showRecommendations, setShowRecommendations] = useState(true);

  const buildGraph = useCallback((subjects: StudentSubjectResponse[], simulated: Record<string, string>, recs: string[], showRecs: boolean) => {
    // 1. Calcular impacto
    const impactMap = new Map<string, number>();
    subjects.forEach(s => {
      const calculateImpact = (id: string, visited = new Set()): number => {
        if (visited.has(id)) return 0;
        visited.add(id);
        const dependents = subjects.filter(sub => 
          sub.careerSubject.prerequisites.some(p => p.id === id)
        );
        return dependents.length + dependents.reduce((acc, dep) => acc + calculateImpact(dep.careerSubject.id, visited), 0);
      };
      impactMap.set(s.careerSubject.id, calculateImpact(s.careerSubject.id));
    });

    // 2. Crear Nodos
    const newNodes = subjects.map((s) => {
      const year = s.careerSubject.year || 1;
      const period = s.careerSubject.period || 1;
      const x = (year - 1) * 320;
      const periodOffset = (period === 0 ? 1.5 : period) * 140;
      
      const subjectsInSameSlot = subjects.filter(sub => 
        sub.careerSubject.year === s.careerSubject.year && 
        sub.careerSubject.period === s.careerSubject.period &&
        sub.id !== s.id
      );
      const indexInSlot = subjectsInSameSlot.findIndex(sub => sub.id === s.id);
      const y = periodOffset + (indexInSlot > -1 ? indexInSlot * 110 : 0);

      let status = simulated[s.careerSubject.id] || s.status;
      
      if (status === 'PENDIENTE') {
        const hasUnmetPrereqs = s.careerSubject.prerequisites.some(p => {
          const prereqId = p.id;
          const prereqStatus = simulated[prereqId] || subjects.find(sub => sub.careerSubject.id === prereqId)?.status;
          return prereqStatus !== 'PROMOCIONADA' && prereqStatus !== 'REGULARIZADA';
        });
        if (hasUnmetPrereqs) status = 'BLOQUEADA';
      }

      const isRecommended = showRecs && recs.includes(s.careerSubject.id);

      return {
        id: s.careerSubject.id,
        type: 'subject',
        position: { x, y },
        data: { 
          name: s.careerSubject.subject.name, 
          code: s.careerSubject.code,
          status,
          impact: impactMap.get(s.careerSubject.id) || 0,
          isAnnual: s.careerSubject.period === 0,
          isSimulated: !!simulated[s.careerSubject.id],
          isRecommended
        },
      };
    });

    // 3. Crear Edges
    const newEdges = subjects.flatMap(s => 
      s.careerSubject.prerequisites.map(p => {
        const isTargetRecommended = showRecs && recs.includes(s.careerSubject.id);
        const isSourceRecommended = showRecs && recs.includes(p.id);
        const isOptimalPath = isTargetRecommended && (isSourceRecommended || s.status === 'EN_CURSO');

        return {
          id: `e-${p.id}-${s.careerSubject.id}`,
          source: p.id,
          target: s.careerSubject.id,
          animated: (simulated[s.careerSubject.id] || s.status) === 'EN_CURSO' || isOptimalPath,
          style: { 
            stroke: isOptimalPath ? 'rgba(var(--primary), 0.8)' : 'rgba(var(--primary), 0.2)', 
            strokeWidth: isOptimalPath ? 3 : 2 
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: isOptimalPath ? 'rgb(var(--primary))' : 'rgba(var(--primary), 0.5)' 
          },
        };
      })
    );

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const [subjects, recsData] = await Promise.all([
          subjectApi.getMySubjects(),
          apiClient.get<Recommendation[]>('/recommendations')
        ]);
        
        const recIds = recsData.map(r => r.careerSubject.id);
        setOriginalSubjects(subjects);
        setRecommendations(recIds);
        buildGraph(subjects, {}, recIds, true);
      } catch (err) {
        console.error('Error fetching data for map:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [buildGraph]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const subjectId = node.id;
    const currentStatus = node.data.status;
    
    setSimulatedStatuses(prev => {
      const next = { ...prev };
      if (currentStatus === 'BLOQUEADA' && !prev[subjectId]) return prev;
      
      if (!prev[subjectId] || prev[subjectId] === 'PENDIENTE') {
        next[subjectId] = 'PROMOCIONADA';
      } else {
        delete next[subjectId];
      }
      
      buildGraph(originalSubjects, next, recommendations, showRecommendations);
      return next;
    });
  };

  const toggleRecommendations = () => {
    const newVal = !showRecommendations;
    setShowRecommendations(newVal);
    buildGraph(originalSubjects, simulatedStatuses, recommendations, newVal);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <header className="flex justify-between items-center bg-card/30 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Network size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Mapa de Carrera</h1>
            <p className="text-xs text-foreground/60 font-medium">Gestiona tu trayectoria académica</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleRecommendations}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-none outline-none ${
              showRecommendations 
              ? 'bg-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20' 
              : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10'
            }`}
          >
            <Sparkles size={14} />
            {showRecommendations ? 'RECOMENDACIONES ACTIVAS' : 'MOSTRAR RECOMENDACIONES'}
          </button>

          {Object.keys(simulatedStatuses).length > 0 && (
            <button 
              onClick={() => { setSimulatedStatuses({}); buildGraph(originalSubjects, {}, recommendations, showRecommendations); }}
              className="text-xs font-bold text-destructive bg-destructive/10 px-4 py-2 rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-all border-none outline-none"
            >
              LIMPIAR SIMULACIÓN ({Object.keys(simulatedStatuses).length})
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden relative shadow-sm">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          maxZoom={1.5}
          minZoom={0.2}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background color="currentColor" className="text-foreground/5" gap={24} />
          <Controls className="!bg-card !border-border !fill-foreground !rounded-xl !shadow-lg" />
          <MiniMap 
            nodeColor={(n) => {
              const status = n.data?.status;
              if (status === 'PROMOCIONADA') return '#22c55e';
              if (status === 'EN_CURSO') return '#4f46e5';
              if (status === 'BLOQUEADA') return '#94a3b8';
              return '#cbd5e1';
            }}
            maskColor="rgb(var(--background) / 0.8)"
            className="!bg-card !border-border !rounded-xl"
            style={{ height: 120 }}
          />
        </ReactFlow>
        
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur p-4 rounded-2xl border border-border shadow-2xl flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest border-b border-border pb-2">Leyenda de Estados</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> <span className="text-[10px] font-bold">APROBADA</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /> <span className="text-[10px] font-bold">CURSANDO</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-foreground/20" /> <span className="text-[10px] font-bold">DISPONIBLE</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-400 opacity-50" /> <span className="text-[10px] font-bold">BLOQUEADA</span></div>
            <div className="flex items-center gap-2 mt-1 col-span-2 pt-2 border-t border-border"><div className="w-3 h-0.5 bg-primary" /> <span className="text-[10px] font-bold text-primary">CAMINO RECOMENDADO</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
