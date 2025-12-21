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
import LazySection from "@/components/LazySection";
import { useDefaultHomeContent } from "../../hooks/useDefaultHomeContent";
import './DefaultHomeContent.css';

export default function DefaultHomeContent() {
  const {
    heroImages,
    isHeroImagesLoading,
    onSubCategoryClick,
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
      />
      <Spacer height={20} />
      <BestProductSection
        products={bestProducts}
        isLoading={isBestProductsLoading}
        onViewAll={onViewAllBestProducts}
      />
      <Spacer height={20} />
      <LazySection minHeight={200}>
        <MiddleBanner
          banners={middleBanners}
          isLoading={isMiddleBannersLoading}
        />
      </LazySection>
      <Spacer height={20} />
      <LazySection minHeight={300}>
        <MdPickSection
          products={mdPicks}
          isLoading={isMdPicksLoading}
        />
      </LazySection>
      <Spacer height={20} />
      <LazySection minHeight={300}>
        <FreshFoodSection
          products={freshFoods}
          isLoading={isFreshFoodsLoading}
          onHeartClick={onHeartClick}
          onViewAll={onViewAllFreshFoods}
        />
      </LazySection>
      <Spacer height={20} />
      <LazySection minHeight={300}>
        <BadameunSection
          products={badameunProducts}
          isLoading={isBadameunLoading}
          onViewAll={onViewAllBadameun}
        />
      </LazySection>
      <Spacer height={20} />
      <LazySection minHeight={250}>
        <BongseonjangTvSection
          tvImages={bongseonjangTvImages}
          isLoading={isBongseonjangTvLoading}
        />
      </LazySection>
      <Spacer height={20} />
      <LazySection minHeight={300}>
        <BongcookSection
          products={bongcookProducts}
          isLoading={isBongcookLoading}
          onViewAll={onViewAllBongcook}
        />
      </LazySection>
      <Spacer height={20} />
      <LazySection minHeight={200}>
        <BottomBanner
          banners={bottomBanners}
          isLoading={isBottomBannersLoading}
        />
      </LazySection>
      <Spacer height={20} />
      <Footer />
    </div>
  );
}
