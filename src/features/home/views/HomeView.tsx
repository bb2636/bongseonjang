import { HomeAppBar } from '../components/HomeAppBar';
import { HomeBottomNav } from '../components/HomeBottomNav';
import './HomeView.css';

type NavItem = 'home' | 'category' | 'search' | 'profile';

interface HomeViewProps {
  homePage: {
    onCartClick: () => void;
    onNavItemClick: (item: NavItem) => void;
  };
}

export default function HomeView({ homePage }: HomeViewProps) {
  const { onCartClick, onNavItemClick } = homePage;

  return (
    <div className="home-view">
      <HomeAppBar onCartClick={onCartClick} />
      
      <main className="home-view__content">
        {/* 콘텐츠 영역 - 추후 구현 */}
      </main>
      
      <HomeBottomNav activeItem="home" onItemClick={onNavItemClick} />
    </div>
  );
}
