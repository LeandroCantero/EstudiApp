
import { Outlet } from 'react-router-dom';
import { MobileNav } from '../widgets/navigation/mobile-nav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Desktop Sidebar Sidebar placeholder could go here */}
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-8 md:px-8">
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <MobileNav />
    </div>
  );
};
