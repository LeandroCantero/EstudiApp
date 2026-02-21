import { useUser } from '@/entities/user/model/use-user';
import { GraduationCap } from 'lucide-react';

export const MobileHeader = () => {
  const { user } = useUser();

  return (
    <header className="md:hidden flex items-center justify-between px-6 py-4 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">Curs</span>App
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold">{user?.name?.split(' ')[0] || 'Invitado'}</span>
          <div className="flex items-center gap-1 text-xs text-foreground/60">
            <GraduationCap size={12} />
            <span className="max-w-[100px] truncate">
              {user?.career?.name || '---'}
            </span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {user?.name?.[0] || 'U'}
        </div>
      </div>
    </header>
  );
};
