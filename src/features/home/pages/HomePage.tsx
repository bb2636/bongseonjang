import HomeView from '../views/HomeView';
import { useHomePage } from '../hooks/useHomePage';

export default function HomePage() {
  const homePage = useHomePage();
  
  return <HomeView homePage={homePage} />;
}
