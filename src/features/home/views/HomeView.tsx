import { HomeAppBar } from '../components/HomeAppBar';
import { HomeBottomNav } from '../components/HomeBottomNav';
import { HeroBanner } from '../components/HeroBanner';
import type { HeroImage } from '../types/heroImage';
import './HomeView.css';

type NavItem = 'home' | 'category' | 'search' | 'profile';

interface HomeViewProps {
  homePage: {
    onCartClick: () => void;
    onNavItemClick: (item: NavItem) => void;
    heroImages: HeroImage[];
    isHeroImagesLoading: boolean;
  };
}

export default function HomeView({ homePage }: HomeViewProps) {
  const { onCartClick, onNavItemClick, heroImages, isHeroImagesLoading } = homePage;

  return (
    <div className="home-view">
      <HomeAppBar onCartClick={onCartClick} />
      
      <main className="home-view__content">
        <HeroBanner heroImages={heroImages} isLoading={isHeroImagesLoading} />
      </main>
      
      <HomeBottomNav activeItem="home" onItemClick={onNavItemClick} />
    </div>
  );
}
