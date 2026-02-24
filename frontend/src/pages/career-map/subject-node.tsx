import { CheckCircle2, Circle, Clock, Lock, Sparkles } from 'lucide-react';
import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface SubjectNodeData {
  name: string;
  code: string;
  status: string;
  impact: number;
  isAnnual: boolean;
  isSimulated: boolean;
  isRecommended: boolean;
}

export const SubjectNode = memo(({ data }: { data: SubjectNodeData }) => {
  const { name, code, status, impact, isAnnual } = data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PROMOCIONADA':
        return { 
          bg: 'bg-green-600', 
          icon: <CheckCircle2 className="text-white" size={14} />,
          text: 'text-white',
          accent: 'text-green-200'
        };
      case 'EN_CURSO':
      case 'RECURSANDO':
        return { 
          bg: 'bg-primary', 
          icon: <Clock className="text-white animate-pulse" size={14} />,
          text: 'text-white',
          accent: 'text-orange-200'
        };
      case 'PENDIENTE':
        return { 
          bg: 'bg-card', 
          icon: <Circle className="text-foreground/20" size={14} />,
          text: 'text-foreground',
          accent: 'text-primary'
        };
      case 'BLOQUEADA':
        return { 
          bg: 'bg-muted/50', 
          icon: <Lock className="text-foreground/40" size={14} />,
          text: 'text-foreground/50',
          accent: 'text-foreground/30'
        };
      default:
        return { bg: 'bg-card', icon: null, text: 'text-foreground', accent: 'text-primary' };
    }
  };

  const config = getStatusConfig(status);
  const isSimulated = data.isSimulated;
  const isRecommended = data.isRecommended;

  // Determinar colores finales basados en estado y recomendación
  const finalBg = isRecommended ? 'bg-amber-400' : config.bg;
  const finalTextColor = isRecommended ? 'text-amber-950' : config.text;
  const finalIcon = isRecommended ? <Sparkles className="text-amber-950 animate-pulse" size={14} /> : config.icon;

  return (
    <div className={`px-4 py-3 rounded-xl shadow-md min-w-[200px] transition-all group hover:shadow-xl ${finalBg} ${finalTextColor} ${isSimulated ? 'border-2 border-white/40 border-dashed' : 'border-none'} ${isRecommended ? 'shadow-[0_0_20px_rgba(251,191,36,0.4)]' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !border-none !bg-transparent opacity-0" />
      
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-start gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${isRecommended ? 'bg-amber-950/10 text-amber-950' : (status === 'PENDIENTE' ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white')}`}>
            {code}
          </span>
          {finalIcon}
        </div>
        
        <h3 className="text-xs font-bold leading-tight line-clamp-2 pr-2">
          {name}
        </h3>

        <div className="flex items-center gap-2 mt-0.5">
           {isAnnual && (
             <span className={`text-[8px] font-black px-1 rounded uppercase tracking-wider ${isRecommended ? 'bg-amber-950/10 text-amber-950' : 'bg-white/20 text-white'}`}>ANUAL</span>
           )}
           {impact > 0 && (
             <span className={`text-[9px] font-medium italic ${isRecommended ? 'text-amber-900/60' : (status === 'BLOQUEADA' ? 'text-foreground/30' : 'opacity-60')}`}>Impacto: {impact}</span>
           )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !border-none !bg-transparent opacity-0" />
    </div>
  );
});

SubjectNode.displayName = 'SubjectNode';
