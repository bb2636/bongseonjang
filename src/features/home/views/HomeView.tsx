import { HomeAppBar } from "../components/HomeAppBar";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { HeroBanner } from "../components/HeroBanner";
import { CategoryTabs } from "../components/CategoryTabs";
import { SubCategoryCards } from "../components/SubCategoryCards";
import { TimeDealSection } from "../components/TimeDealSection";
import { BestProductSection } from "../components/BestProductSection";
import { MiddleBanner } from "../components/MiddleBanner";
import { FreshFoodSection } from "../components/FreshFoodSection";
import { MdPickSection } from "../components/MdPickSection";
import { Spacer } from "@/components/Spacer";
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
    mdPicks,
    isMdPicksLoading,
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
        <Spacer height={20} />
        <BestProductSection
          products={bestProducts}
          isLoading={isBestProductsLoading}
          onAddToCart={onAddToCart}
          onViewAll={onViewAllBestProducts}
        />
        <Spacer height={20} />
        <MiddleBanner
          banners={middleBanners}
          isLoading={isMiddleBannersLoading}
        />
        <Spacer height={20} />
        <MdPickSection
          products={mdPicks}
          isLoading={isMdPicksLoading}
          onAddToCart={onAddToCart}
        />
        <Spacer height={20} />
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
