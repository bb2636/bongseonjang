import { MainLayout } from '../../../layouts';
import HomeShellView from '../views/HomeShellView';
import { useHomeShell } from '../hooks/useHomeShell';

export default function HomePage() {
  const shell = useHomeShell();
  
  return (
    <MainLayout onHomeClick={shell.onLogoClick}>
      <HomeShellView shell={shell} />
    </MainLayout>
  );
}
