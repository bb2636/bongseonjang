import { HeroBanner } from "../HeroBanner";
import { SubCategoryCards } from "../SubCategoryCards";
import { TimeDealSection } from "../TimeDealSection";
import { BestProductSection } from "../BestProductSection";
import { MiddleBanner } from "../MiddleBanner";
import { FreshFoodSection } from "../FreshFoodSection";
import { MdPickSection } from "../MdPickSection";
import { BadameunSection } from "../BadameunSection";
import { BongseonjangTvSection } from "../BongseonjangTvSection";
import { BongcookSection } from "../BongcookSection";
import { BottomBanner } from "../BottomBanner";
import { Footer } from "../Footer";
import { Spacer } from "@/components/Spacer";
import { useDefaultHomeContent } from "../../hooks/useDefaultHomeContent";
import './DefaultHomeContent.css';

export default function DefaultHomeContent() {
  const {
    heroImages,
    isHeroImagesLoading,
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
    badameunProducts,
    isBadameunLoading,
    onViewAllBadameun,
    bongseonjangTvImages,
    isBongseonjangTvLoading,
    bongcookProducts,
    isBongcookLoading,
    onViewAllBongcook,
    bottomBanners,
    isBottomBannersLoading,
  } = useDefaultHomeContent();

  return (
    <div className="default-home-content">
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
      <Spacer height={20} />
      <BadameunSection
        products={badameunProducts}
        isLoading={isBadameunLoading}
        onAddToCart={onAddToCart}
        onViewAll={onViewAllBadameun}
      />
      <Spacer height={20} />
      <BongseonjangTvSection
        tvImages={bongseonjangTvImages}
        isLoading={isBongseonjangTvLoading}
      />
      <Spacer height={20} />
      <BongcookSection
        products={bongcookProducts}
        isLoading={isBongcookLoading}
        onAddToCart={onAddToCart}
        onViewAll={onViewAllBongcook}
      />
      <Spacer height={20} />
      <BottomBanner
        banners={bottomBanners}
        isLoading={isBottomBannersLoading}
      />
      <Spacer height={20} />
      <Footer />
    </div>
  );
}
