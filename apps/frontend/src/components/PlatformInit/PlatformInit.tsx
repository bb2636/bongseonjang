import type { ReactNode } from 'react';
import { usePlatformDetect } from '@/hooks/usePlatformDetect';

interface PlatformInitProps {
  children: ReactNode;
}

export function PlatformInit({ children }: PlatformInitProps) {
  usePlatformDetect();
  return <>{children}</>;
}
