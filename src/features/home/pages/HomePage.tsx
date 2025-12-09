import HomeShellView from '../views/HomeShellView';
import { useHomeShell } from '../hooks/useHomeShell';

export default function HomePage() {
  const shell = useHomeShell();
  
  return <HomeShellView shell={shell} />;
}
