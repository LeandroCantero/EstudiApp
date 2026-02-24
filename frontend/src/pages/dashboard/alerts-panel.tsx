import { DashboardAlert } from '@/entities/dashboard/model/use-dashboard';
import { AlertTriangle, Lock, X } from 'lucide-react';
import { useState } from 'react';

interface AlertsPanelProps {
  alerts: DashboardAlert[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {visibleAlerts.map((alert) => (
        <div 
          key={alert.id}
          className={`relative overflow-hidden group p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in slide-in-from-top-2 duration-300 ${
            alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
              ? 'bg-red-500/10 border-red-500/20 text-red-700'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700'
          }`}
        >
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            alert.priority === 'CRITICAL' || alert.priority === 'HIGH'
              ? 'bg-red-500/20'
              : 'bg-yellow-500/20'
          }`}>
            {alert.type === 'CORRELATIVE_BLOCK' ? <Lock size={18} /> : <AlertTriangle size={18} />}
          </div>
          
          <div className="flex flex-col gap-0.5 flex-1 pr-6">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              {alert.priority === 'CRITICAL' ? 'Prioridad Crítica' : 'Aviso Académico'}
            </span>
            <p className="text-sm font-bold leading-tight">
              {alert.message}
            </p>
          </div>

          <button 
            onClick={() => setDismissed([...dismissed, alert.id])}
            className="absolute top-3 right-3 p-1 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
