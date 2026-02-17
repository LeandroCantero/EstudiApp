
import { Outlet } from 'react-router-dom';
import { MobileNav } from '../widgets/navigation/mobile-nav';
import { Sidebar } from '../widgets/navigation/sidebar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:px-10 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Bottom Nav for Mobile */}
        <MobileNav />
      </div>
    </div>
  );
};
