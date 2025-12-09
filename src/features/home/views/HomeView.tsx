import { HomeAppBar } from "../components/HomeAppBar";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { HeroBanner } from "../components/HeroBanner";
import { CategoryTabs } from "../components/CategoryTabs";
import { SubCategoryCards } from "../components/SubCategoryCards";
import { TimeDealSection } from "../components/TimeDealSection";
import { BestProductSection } from "../components/BestProductSection";
import { MiddleBanner } from "../components/MiddleBanner";
import { FreshFoodSection } from "../components/FreshFoodSection";
import type { HomePageState } from "../hooks/useHomePage";
import "./HomeView.css";

interface HomeViewProps {
  homePage: HomePageState;
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
