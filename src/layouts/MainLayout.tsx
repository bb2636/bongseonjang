import { ReactNode } from 'react';
import { BottomNav } from '../components/BottomNav';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  onHomeClick?: () => void;
}

export function MainLayout({ 
  children, 
  showBottomNav = true,
  onHomeClick 
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      <main className="main-layout__content">
        {children}
      </main>
      {showBottomNav && <BottomNav onHomeClick={onHomeClick} />}
    </div>
  );
}
