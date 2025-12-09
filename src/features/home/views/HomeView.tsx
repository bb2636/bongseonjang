import { HomeAppBar } from '../components/HomeAppBar';
import { HomeBottomNav } from '../components/HomeBottomNav';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryTabs } from '../components/CategoryTabs';
import type { HeroImage } from '../types/heroImage';
import './HomeView.css';

type NavItem = 'home' | 'category' | 'search' | 'profile';
type CategoryTab = 'best' | 'new' | 'event' | 'all';

interface HomeViewProps {
  homePage: {
    onCartClick: () => void;
    onNavItemClick: (item: NavItem) => void;
    heroImages: HeroImage[];
    isHeroImagesLoading: boolean;
    activeTab: CategoryTab;
    onTabChange: (tab: CategoryTab) => void;
  };
}

export default function HomeView({ homePage }: HomeViewProps) {
  const { onCartClick, onNavItemClick, heroImages, isHeroImagesLoading, activeTab, onTabChange } = homePage;

  return (
    <div className="home-view">
      <HomeAppBar onCartClick={onCartClick} />
      
      <main className="home-view__content">
        <HeroBanner heroImages={heroImages} isLoading={isHeroImagesLoading} />
        <CategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
      </main>
      
      <HomeBottomNav activeItem="home" onItemClick={onNavItemClick} />
    </div>
  );
}
