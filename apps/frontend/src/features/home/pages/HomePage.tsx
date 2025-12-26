import { useEffect } from 'react';
import { MainLayout } from '../../../layouts';
import HomeShellView from '../views/HomeShellView';
import { useHomeShell } from '../hooks/useHomeShell';
import { prefetchCriticalPages, prefetchSecondaryPages } from '../../../utils/prefetch';

export default function HomePage() {
  const shell = useHomeShell();
  
  useEffect(() => {
    prefetchCriticalPages();
    const timer = setTimeout(() => {
      prefetchSecondaryPages();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <MainLayout onHomeClick={shell.onLogoClick}>
      <HomeShellView shell={shell} />
    </MainLayout>
  );
}
