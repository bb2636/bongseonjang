import { HomeAppBar } from "../components/HomeAppBar";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { HeroBanner } from "../components/HeroBanner";
import { CategoryTabs } from "../components/CategoryTabs";
import { SubCategoryCards } from "../components/SubCategoryCards";
import { TimeDealSection } from "../components/TimeDealSection";
import type { HeroImage } from "../types/heroImage";
import type { TimeDeal } from "../types/timeDeal";
import "./HomeView.css";

type NavItem = "home" | "category" | "search" | "profile";
type CategoryTab = "best" | "new" | "event" | "all";

interface HomeViewProps {
  homePage: {
    onCartClick: () => void;
    onNavItemClick: (item: NavItem) => void;
    heroImages: HeroImage[];
    isHeroImagesLoading: boolean;
    activeTab: CategoryTab;
    onTabChange: (tab: CategoryTab) => void;
    onSubCategoryClick: (categoryId: string) => void;
    onAddToCart: (productId: string) => void;
    timeDeals: TimeDeal[];
    isTimeDealsLoading: boolean;
  };
}

export default function HomeView({ homePage }: HomeViewProps) {
  const {
    onCartClick,
    onNavItemClick,
    heroImages,
    isHeroImagesLoading,
    activeTab,
    onTabChange,
    onSubCategoryClick,
    onAddToCart,
    timeDeals,
    isTimeDealsLoading,
  } = homePage;

  return (
    <div className="home-view">
      <HomeAppBar onCartClick={onCartClick} />

      <main className="home-view__content">
        <CategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
        <HeroBanner heroImages={heroImages} isLoading={isHeroImagesLoading} />
        <SubCategoryCards onCategoryClick={onSubCategoryClick} />
        <TimeDealSection 
          timeDeals={timeDeals} 
          isLoading={isTimeDealsLoading} 
          onAddToCart={onAddToCart} 
        />
      </main>

      <HomeBottomNav activeItem="home" onItemClick={onNavItemClick} />
    </div>
  );
}
