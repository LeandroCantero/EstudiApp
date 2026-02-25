import { CheckCircle2, Circle, Clock, Lock, MinusCircle, Sparkles } from 'lucide-react';
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

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PROMOCIONADA':
      return {
        bg: 'bg-green-600',
        icon: <CheckCircle2 className="text-white" size={13} />,
        text: 'text-white',
        badge: 'bg-white/20 text-white',
        label: 'APROBADA',
      };
    case 'REGULARIZADA':
      return {
        bg: 'bg-blue-600',
        icon: <MinusCircle className="text-white" size={13} />,
        text: 'text-white',
        badge: 'bg-white/20 text-white',
        label: 'REGULAR',
      };
    case 'EN_CURSO':
    case 'RECURSANDO':
      return {
        bg: 'bg-primary',
        icon: <Clock className="text-white animate-pulse" size={13} />,
        text: 'text-white',
        badge: 'bg-white/20 text-white',
        label: 'EN CURSO',
      };
    case 'PENDIENTE':
      return {
        bg: 'bg-card',
        icon: <Circle className="text-foreground/20" size={13} />,
        text: 'text-foreground',
        badge: 'bg-primary/10 text-primary',
        label: 'PENDIENTE',
      };
    case 'BLOQUEADA':
      return {
        bg: 'bg-muted/50',
        icon: <Lock className="text-foreground/30" size={13} />,
        text: 'text-foreground/40',
        badge: 'bg-foreground/5 text-foreground/30',
        label: 'BLOQUEADA',
      };
    default:
      return {
        bg: 'bg-card',
        icon: null,
        text: 'text-foreground',
        badge: 'bg-primary/10 text-primary',
        label: status,
      };
  }
};

export const SubjectNode = memo(({ data }: { data: SubjectNodeData }) => {
  const { name, code, status, impact, isAnnual, isSimulated, isRecommended } = data;

  const config = getStatusConfig(status);

  const finalBg = isRecommended ? 'bg-amber-400' : config.bg;
  const finalText = isRecommended ? 'text-amber-950' : config.text;
  const finalBadge = isRecommended ? 'bg-amber-950/10 text-amber-950' : config.badge;
  const finalIcon = isRecommended
    ? <Sparkles className="text-amber-950 animate-pulse" size={13} />
    : config.icon;

  return (
    <div
      className={`
        px-3 py-2.5 rounded-xl shadow-md min-w-[175px] max-w-[210px]
        transition-all group hover:shadow-xl hover:scale-[1.02] cursor-pointer
        ${finalBg} ${finalText}
        ${isSimulated ? 'border-2 border-white/40 border-dashed' : 'border border-border/10'}
        ${isRecommended ? 'shadow-[0_0_18px_rgba(251,191,36,0.45)]' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !border-none !bg-transparent opacity-0" />

      <div className="flex flex-col gap-1">
        {/* Top row: code + icon */}
        <div className="flex justify-between items-center gap-2">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none tracking-wide ${finalBadge}`}>
            {code}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isAnnual && (
              <span className={`text-[8px] font-black px-1 rounded uppercase tracking-wider ${isRecommended ? 'bg-amber-950/10 text-amber-950' : 'bg-white/20 text-white'}`}>
                ANUAL
              </span>
            )}
            {finalIcon}
          </div>
        </div>

        {/* Subject name */}
        <h3 className="text-[11px] font-bold leading-tight line-clamp-2">
          {name}
        </h3>

        {/* Impact */}
        {impact > 0 && (
          <p className={`text-[9px] font-medium italic ${isRecommended ? 'text-amber-900/60' : (status === 'BLOQUEADA' ? 'text-foreground/25' : 'opacity-50')}`}>
            Impacto: {impact}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !border-none !bg-transparent opacity-0" />
    </div>
  );
});

SubjectNode.displayName = 'SubjectNode';
