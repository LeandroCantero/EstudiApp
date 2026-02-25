import { memo } from 'react';

interface QuarterHeaderData {
  label: string;
  subLabel: string;
}

export const QuarterHeaderNode = memo(({ data }: { data: QuarterHeaderData }) => {
  return (
    <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
      <div className="px-4 py-2 rounded-xl bg-card/60 backdrop-blur border border-border/40 shadow-sm text-center min-w-[180px]">
        <p className="text-[11px] font-black uppercase tracking-widest text-primary">{data.label}</p>
        <p className="text-[9px] font-medium text-foreground/40 uppercase tracking-wider mt-0.5">{data.subLabel}</p>
      </div>
      <div className="w-px h-4 bg-border/30" />
    </div>
  );
});

QuarterHeaderNode.displayName = 'QuarterHeaderNode';
