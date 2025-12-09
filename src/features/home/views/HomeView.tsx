import { HomeAppBar } from "../components/HomeAppBar";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { HeroBanner } from "../components/HeroBanner";
import { CategoryTabs } from "../components/CategoryTabs";
import { SubCategoryCards } from "../components/SubCategoryCards";
import { TimeDealSection } from "../components/TimeDealSection";
import { BestProductSection } from "../components/BestProductSection";
import { MiddleBanner } from "../components/MiddleBanner";
import { FreshFoodSection } from "../components/FreshFoodSection";
import type { HeroImage } from "../types/heroImage";
import type { TimeDeal } from "../types/timeDeal";
import type { BestProduct } from "../types/bestProduct";
import type { MiddleBannerImage } from "../types/middleBanner";
import type { FreshFood } from "../types/freshFood";
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
    onHeartClick: (productId: string) => void;
    timeDeals: TimeDeal[];
    isTimeDealsLoading: boolean;
    bestProducts: BestProduct[];
    isBestProductsLoading: boolean;
    onViewAllBestProducts: () => void;
    middleBanners: MiddleBannerImage[];
    isMiddleBannersLoading: boolean;
    freshFoods: FreshFood[];
    isFreshFoodsLoading: boolean;
    onViewAllFreshFoods: () => void;
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
    onHeartClick,
    timeDeals,
    isTimeDealsLoading,
    bestProducts,
    isBestProductsLoading,
    onViewAllBestProducts,
    middleBanners,
    isMiddleBannersLoading,
    freshFoods,
    isFreshFoodsLoading,
    onViewAllFreshFoods,
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
        <BestProductSection
          products={bestProducts}
          isLoading={isBestProductsLoading}
          onAddToCart={onAddToCart}
          onViewAll={onViewAllBestProducts}
        />
        <MiddleBanner
          banners={middleBanners}
          isLoading={isMiddleBannersLoading}
        />
        <FreshFoodSection
          products={freshFoods}
          isLoading={isFreshFoodsLoading}
          onAddToCart={onAddToCart}
          onHeartClick={onHeartClick}
          onViewAll={onViewAllFreshFoods}
        />
      </main>

      <HomeBottomNav activeItem="home" onItemClick={onNavItemClick} />
    </div>
  );
}
