import { useCallback } from 'react';
import { useToast } from '../../../contexts';

interface HomePageNamespace {
  welcomeMessage: string;
  featureList: string[];
  handleGetStarted: () => void;
}

export function useHomePage(): HomePageNamespace {
  const { showToast } = useToast();
  
  const welcomeMessage = 'Welcome to Your Project';
  
  const featureList = [
    'React 18 + TypeScript',
    'Vanilla CSS',
    'React Query',
    'Express.js Backend',
    'TypeORM + PostgreSQL',
    'Clean Architecture',
  ];
  
  const handleGetStarted = useCallback(() => {
    showToast('프로젝트를 시작합니다!', 'success');
  }, [showToast]);
  
  return {
    welcomeMessage,
    featureList,
    handleGetStarted,
  };
}
