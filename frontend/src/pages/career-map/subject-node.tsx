import { CheckCircle2, Circle, Clock, Lock } from 'lucide-react';
import { memo } from 'react';
import { Handle, Position } from 'reactflow';

export const SubjectNode = memo(({ data }: any) => {
  const { name, code, status, impact, isAnnual } = data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PROMOCIONADA':
        return { 
          bg: 'bg-green-500/10', 
          border: 'border-green-500/30', 
          icon: <CheckCircle2 className="text-green-500" size={14} />,
          text: 'text-green-600'
        };
      case 'EN_CURSO':
      case 'RECURSANDO':
        return { 
          bg: 'bg-primary/10', 
          border: 'border-primary/30', 
          icon: <Clock className="text-primary animate-pulse" size={14} />,
          text: 'text-primary'
        };
      case 'PENDIENTE':
        return { 
          bg: 'bg-background', 
          border: 'border-foreground/10', 
          icon: <Circle className="text-foreground/20" size={14} />,
          text: 'text-foreground/40'
        };
      case 'BLOQUEADA':
        return { 
          bg: 'bg-foreground/5', 
          border: 'border-foreground/5', 
          icon: <Lock className="text-foreground/20" size={14} />,
          text: 'text-foreground/30'
        };
      default:
        return { bg: 'bg-card', border: 'border-border', icon: null, text: '' };
    }
  };

  const config = getStatusConfig(status);
  const isSimulated = data.isSimulated;
  const isRecommended = data.isRecommended;

  return (
    <div className={`px-4 py-3 rounded-xl border-2 ${config.bg} ${config.border} shadow-sm min-w-[180px] transition-all group hover:shadow-md hover:border-primary/50 ${isSimulated ? 'border-dashed' : ''} ${isRecommended ? 'ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(250,129,18,0.2)]' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-foreground/20" />


      
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase leading-none">
            {code}
          </span>
          {config.icon}
        </div>
        
        <h3 className="text-xs font-bold leading-tight line-clamp-2 pr-2">
          {name}
        </h3>

        <div className="flex items-center gap-2 mt-1">
           {data.isRecommended && (
             <span className="text-[8px] font-black bg-yellow-500/20 text-yellow-700 px-1 rounded flex items-center gap-1">
               ⭐ RECOMENDADA
             </span>
           )}
           {isAnnual && (

             <span className="text-[8px] font-black bg-orange-500/10 text-orange-600 px-1 rounded">ANUAL</span>
           )}
           {impact > 0 && (
             <span className="text-[9px] font-medium text-foreground/40 italic">Impacto: {impact}</span>
           )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-foreground/20" />
    </div>
  );
});

SubjectNode.displayName = 'SubjectNode';
