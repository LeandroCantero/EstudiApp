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
import { SubjectNode } from './subject-node';

const nodeTypes = {
  subject: SubjectNode,
};

interface SubjectNodeData {
  name: string;
  code: string;
  status: string;
  impact: number;
  isAnnual: boolean;
  isSimulated: boolean;
  isRecommended: boolean;
}

export const CareerMapPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalSubjects, setOriginalSubjects] = useState<StudentSubjectResponse[]>([]);
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, string>>({});
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  const calculateRecommendations = useCallback((subjects: StudentSubjectResponse[], currentSimulated: Record<string, string>) => {
    // Implementación frontend de RN9: Recomendación Estricta
    // 1. Identificar candidatas (PENDIENTE y con correlativas promocionadas)
    return subjects
      .filter(s => {
        const status = currentSimulated[s.careerSubject.id] || s.status;
        if (status !== 'PENDIENTE') return false;

        // Todas las correlativas deben estar PROMOCIONADA
        return s.careerSubject.prerequisites.every(pre => {
          const preStatus = currentSimulated[pre.id] || subjects.find(sub => sub.careerSubject.id === pre.id)?.status;
          return preStatus === 'PROMOCIONADA';
        });
      })
      .map(s => s.careerSubject.id);
  }, []);

  const buildGraph = useCallback((subjects: StudentSubjectResponse[], simulated: Record<string, string>, showRecs: boolean) => {
    // Recalcular recomendaciones basadas en el estado simulado
    const currentRecs = calculateRecommendations(subjects, simulated);
    
    // 1. Calcular impacto y profundidad
    const impactMap = new Map<string, number>();
    const depthMap = new Map<string, number>();

    const calculateDepth = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      visited.add(id);
      const sub = subjects.find(s => s.careerSubject.id === id);
      if (!sub || sub.careerSubject.prerequisites.length === 0) return 0;
      return 1 + Math.max(...sub.careerSubject.prerequisites.map(p => calculateDepth(p.id, visited)));
    };

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
      depthMap.set(s.careerSubject.id, calculateDepth(s.careerSubject.id));
    });

    // 2. Organizar por Dependencia para el Layout (DAG)
    const colWidth = 350;
    const subjectHeight = 120;
    
    // Agrupar por profundidad (nivel en el grafo)
    const columns: Record<number, StudentSubjectResponse[]> = {};
    subjects.forEach(s => {
      const depth = depthMap.get(s.careerSubject.id) || 0;
      if (!columns[depth]) columns[depth] = [];
      columns[depth].push(s);
    });

    // 3. Crear o Actualizar Nodos
    setNodes(nds => {
      const newNodes: Node[] = [];
      
      Object.entries(columns).forEach(([depthStr, colSubjects]) => {
        const depth = parseInt(depthStr);
        const x = depth * colWidth;
        
        const sortedInCol = [...colSubjects].sort((a, b) => {
          const yearA = a.careerSubject.year || 0;
          const yearB = b.careerSubject.year || 0;
          if (yearA !== yearB) return yearA - yearB;
          return (impactMap.get(b.careerSubject.id) || 0) - (impactMap.get(a.careerSubject.id) || 0);
        });
        
        sortedInCol.forEach((s, index) => {
          const y = index * subjectHeight;
          const status = simulated[s.careerSubject.id] || s.status;
          const isRecommended = showRecs && currentRecs.includes(s.careerSubject.id);
          
          let finalStatus = status;
          if (status === 'PENDIENTE') {
            const hasUnmetPrereqs = s.careerSubject.prerequisites.some(pre => {
              const prereqStatus = simulated[pre.id] || subjects.find(sub => sub.careerSubject.id === pre.id)?.status;
              return prereqStatus !== 'PROMOCIONADA' && prereqStatus !== 'REGULARIZADA';
            });
            if (hasUnmetPrereqs) finalStatus = 'BLOQUEADA';
          }

          // Intentar encontrar el nodo existente para preservar su posición
          const existingNode = nds.find(n => n.id === s.careerSubject.id);
          
          newNodes.push({
            id: s.careerSubject.id,
            type: 'subject',
            position: existingNode ? existingNode.position : { x, y },
            data: { 
              name: s.careerSubject.subject.name, 
              code: s.careerSubject.code,
              status: finalStatus,
              impact: impactMap.get(s.careerSubject.id) || 0,
              isAnnual: s.careerSubject.period === 0,
              isSimulated: !!simulated[s.careerSubject.id],
              isRecommended
            },
          });
        });
      });
      return newNodes;
    });

    // 4. Crear Edges
    const newEdges = subjects.flatMap(s => 
      s.careerSubject.prerequisites.map(p => {
        const isTargetRecommended = showRecs && currentRecs.includes(s.careerSubject.id);
        const isSourceRecommended = showRecs && currentRecs.includes(p.id);
        const isOptimalPath = isTargetRecommended && (isSourceRecommended || (simulated[p.id] || subjects.find(sub => sub.careerSubject.id === p.id)?.status) === 'PROMOCIONADA');

        return {
          id: `e-${p.id}-${s.careerSubject.id}`,
          source: p.id,
          target: s.careerSubject.id,
          animated: isOptimalPath,
          style: { 
            stroke: isOptimalPath ? '#fa8112' : 'rgba(var(--foreground), 0.1)', 
            strokeWidth: isOptimalPath ? 3 : 2 
          },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: isOptimalPath ? '#fa8112' : 'rgba(var(--foreground), 0.2)' 
          },
        };
      })
    );

    setEdges(newEdges);
  }, [setNodes, setEdges, calculateRecommendations]);

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
    const subjectId = node.id;
    const currentSimStatus = simulatedStatuses[subjectId];
    const originalSubject = originalSubjects.find(s => s.careerSubject.id === subjectId);
    if (!originalSubject) return;

    // Si la materia está bloqueada y no estamos ya simulándola, no permitimos interactuar
    if (node.data.status === 'BLOQUEADA' && !currentSimStatus) {
      return;
    }

    setSimulatedStatuses(prev => {
      const next = { ...prev };
      const isSimulating = !!currentSimStatus;
      
      if (isSimulating) {
        // Al hacer clic de nuevo, removemos la simulación y vuelve a su estado real (sea EN_CURSO, PENDIENTE, etc)
        delete next[subjectId];
      } else {
        // Si no se está simulando, toggleamos:
        // - Si está Aprobada -> Pendiente (para ver qué se bloquea)
        // - Si está cualquier otra cosa -> Aprobada (para ver qué se desbloquea)
        if (originalSubject.status === 'PROMOCIONADA') {
          next[subjectId] = 'PENDIENTE';
        } else {
          next[subjectId] = 'PROMOCIONADA';
        }
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
      <header className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md p-3 px-5 rounded-2xl border border-border/50 shadow-xl pointer-events-auto">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Network size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none mb-1">Mapa de Carrera</h1>
            <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-wider">Simulador de Trayectoria</p>
          </div>
        </div>
        
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
                onClick={() => { setSimulatedStatuses({}); buildGraph(originalSubjects, {}, showRecommendations); }}
                className="text-[10px] font-black text-destructive bg-destructive/10 backdrop-blur-md px-4 py-2.5 rounded-xl hover:bg-destructive hover:text-white transition-all border border-destructive/20 shadow-xl shadow-destructive/10 outline-none"
              >
                LIMPIAR ({Object.keys(simulatedStatuses).length})
              </button>
            )}
          </div>

          {/* LEYENDA INTELIGENTE REUBICADA */}
          <div 
            className={`bg-card/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${showLegend ? 'p-4 w-[200px] gap-3' : 'p-2 w-10 h-10 items-center justify-center cursor-pointer hover:bg-card hover:scale-105'}`} 
            onClick={() => !showLegend && setShowLegend(true)}
          >
            {showLegend ? (
              <>
                <div className="flex justify-between items-center border-b border-border/20 pb-2">
                  <p className="text-[9px] font-black uppercase text-foreground/40 tracking-widest">Leyenda</p>
                  <button onClick={(e) => { e.stopPropagation(); setShowLegend(false); }} className="p-1 hover:bg-foreground/5 rounded-md transition-colors">
                    <X size={12} className="text-foreground/40" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-green-600" /> <span className="text-[9px] font-bold">APROBADA</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-primary" /> <span className="text-[9px] font-bold">CURSANDO</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-card border border-foreground/10" /> <span className="text-[9px] font-bold text-foreground/60">PENDIENTE</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-muted/50 border border-foreground/5" /> <span className="text-[9px] font-bold text-foreground/30">BLOQUEADA</span></div>
                  <div className="flex items-center gap-2 mt-1 pt-2 border-t border-border/20 flex-wrap">
                    <div className="w-3.5 h-3.5 rounded bg-amber-400" /> 
                    <span className="text-[9px] font-bold text-amber-500">RECOMENDADO</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-foreground/40" title="Ver leyenda">
                <Network size={16} />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 bg-background relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          maxZoom={1.5}
          minZoom={0.1}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background color="currentColor" className="text-foreground/5" gap={24} />
          <Controls showInteractive={false} className="mb-24 md:mb-0" />
          <MiniMap 
            nodeColor={(n) => {
              const status = n.data?.status;
              if (status === 'PROMOCIONADA') return '#16a34a';
              if (status === 'EN_CURSO') return '#fa8112';
              if (status === 'BLOQUEADA') return '#94a3b8';
              return '#cbd5e1';
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
