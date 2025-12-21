import { useEffect } from 'react';
import { MainLayout } from '../../../layouts';
import HomeShellView from '../views/HomeShellView';
import { useHomeShell } from '../hooks/useHomeShell';
import { prefetchCriticalPages, prefetchSecondaryPages } from '../../../utils/prefetch';

export default function HomePage() {
  const shell = useHomeShell();
  
  useEffect(() => {
    const startPrefetching = () => {
      prefetchCriticalPages();
      
      setTimeout(() => {
        prefetchSecondaryPages();
      }, 2000);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(startPrefetching, { timeout: 3000 });
      return () => cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(startPrefetching, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  return (
    <MainLayout onHomeClick={shell.onLogoClick}>
      <HomeShellView shell={shell} />
    </MainLayout>
  );
}
