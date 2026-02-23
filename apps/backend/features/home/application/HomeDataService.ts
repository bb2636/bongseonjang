import { BongseonjangTvService } from '../../bongseonjangTv/application/BongseonjangTvService';
import { ProductService } from '../../product/application/ProductService';
import { bannerRepository } from '../../banner/repository/bannerRepository';
import { repositories } from '../../../config/repositories';
import { TypeORMProductRepository } from '../../product/repository/TypeORMProductRepository';
import { ReviewService, TypeORMReviewRepository, TypeORMReviewImageRepository } from '../../review';
import { TypeORMReviewableOrderItemRepository } from '../../review/repository/TypeORMReviewableOrderItemRepository';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';
import { MemoryCache } from '../../../common/utils/memoryCache.js';

const HOME_CACHE_TTL_MS = 300000;
const CACHE_KEY_ABOVE_FOLD = 'above-fold';
const CACHE_KEY_BELOW_FOLD = 'below-fold';

export interface HomeDataResponse {
  heroImages: Array<{ id: number; imageUrl: string; linkUrl: string | null }>;
  timeDeals: Array<any>;
  bestProducts: Array<any>;
  middleBanners: Array<{ id: number; imageUrl: string; linkUrl: string | null }>;
  freshProducts: Array<any>;
  mdPicks: Array<any>;
  weeklyProducts: Array<any>;
  badameunProducts: Array<any>;
  bongseonjangTv: Array<any>;
  bongcookProducts: Array<any>;
  bottomBanners: Array<{ id: number; imageUrl: string; linkUrl: string | null }>;
}

export const homeDataCache = new MemoryCache<any>();

export class HomeDataService {
  private static homeCache = homeDataCache;

  private bongseonjangTvService: BongseonjangTvService;
  private productService: ProductService;

  constructor() {
    this.bongseonjangTvService = new BongseonjangTvService(repositories.bongseonjangTv);
    
    const productRepository = new TypeORMProductRepository();
    const reviewRepository = new TypeORMReviewRepository();
    const reviewImageRepository = new TypeORMReviewImageRepository();
    const reviewableOrderItemRepository = new TypeORMReviewableOrderItemRepository();
    const reviewService = new ReviewService(reviewRepository, reviewImageRepository, reviewableOrderItemRepository);
    this.productService = new ProductService(productRepository, reviewService);
  }

  private async getBannersByPosition(positionCode: string): Promise<Array<{ id: number; imageUrl: string; linkUrl: string | null }>> {
    const banners = await bannerRepository.findBannersByPositionCode(positionCode);
    const now = new Date();
    
    const activeBanners = banners.filter(banner => {
      if (!banner.isActive) return false;
      if (banner.startedAt && banner.startedAt > now) return false;
      if (banner.endedAt && banner.endedAt < now) return false;
      return true;
    });

    return activeBanners.map(banner => ({
      id: banner.id,
      imageUrl: toAbsoluteImageUrl(banner.imageUrl),
      linkUrl: banner.linkUrl ?? null,
    }));
  }

  async getHomeData(): Promise<HomeDataResponse> {
    const [
      heroImages,
      timeDeals,
      allBestProducts,
      middleBanners,
      allFreshProducts,
      allMdPicks,
      allWeeklyProducts,
      allBadameunProducts,
      bongseonjangTv,
      allBongcookProducts,
      bottomBanners,
    ] = await Promise.all([
      this.getBannersByPosition('HOME_HERO'),
      this.productService.getTimeDeals(10),
      this.productService.getProductsByDisplayCategory('베스트'),
      this.getBannersByPosition('HOME_MIDDLE'),
      this.productService.getProductsByDisplayCategory('신선식품'),
      this.productService.getProductsByDisplayCategory('MD추천!'),
      this.productService.getProductsByDisplayCategory('이주의 상품'),
      this.productService.getProductsByDisplayCategory('바담은 제품'),
      this.bongseonjangTvService.getAllImages(),
      this.productService.getProductsByDisplayCategory('봉쿡 제품'),
      this.getBannersByPosition('HOME_BOTTOM'),
    ]);

    return {
      heroImages,
      timeDeals,
      bestProducts: allBestProducts.slice(0, 10),
      middleBanners,
      freshProducts: allFreshProducts.slice(0, 10),
      mdPicks: allMdPicks.slice(0, 10),
      weeklyProducts: allWeeklyProducts.slice(0, 10),
      badameunProducts: allBadameunProducts.slice(0, 10),
      bongseonjangTv,
      bongcookProducts: allBongcookProducts.slice(0, 10),
      bottomBanners,
    };
  }

  async getAboveFoldData(): Promise<Pick<HomeDataResponse, 'heroImages' | 'timeDeals' | 'bestProducts'>> {
    const cached = HomeDataService.homeCache.get(CACHE_KEY_ABOVE_FOLD);
    if (cached) {
      return cached;
    }

    const [heroImages, timeDeals, allBestProducts] = await Promise.all([
      this.getBannersByPosition('HOME_HERO'),
      this.productService.getTimeDeals(10),
      this.productService.getProductsByDisplayCategory('베스트'),
    ]);

    const result = { heroImages, timeDeals, bestProducts: allBestProducts.slice(0, 10) };
    HomeDataService.homeCache.set(CACHE_KEY_ABOVE_FOLD, result, HOME_CACHE_TTL_MS);
    return result;
  }

  async getBelowFoldData(): Promise<Omit<HomeDataResponse, 'heroImages' | 'timeDeals' | 'bestProducts'>> {
    const cached = HomeDataService.homeCache.get(CACHE_KEY_BELOW_FOLD);
    if (cached) {
      return cached;
    }

    const [
      middleBanners,
      allFreshProducts,
      allMdPicks,
      allWeeklyProducts,
      allBadameunProducts,
      bongseonjangTv,
      allBongcookProducts,
      bottomBanners,
    ] = await Promise.all([
      this.getBannersByPosition('HOME_MIDDLE'),
      this.productService.getProductsByDisplayCategory('신선식품'),
      this.productService.getProductsByDisplayCategory('MD추천!'),
      this.productService.getProductsByDisplayCategory('이주의 상품'),
      this.productService.getProductsByDisplayCategory('바담은 제품'),
      this.bongseonjangTvService.getAllImages(),
      this.productService.getProductsByDisplayCategory('봉쿡 제품'),
      this.getBannersByPosition('HOME_BOTTOM'),
    ]);

    const result = {
      middleBanners,
      freshProducts: allFreshProducts.slice(0, 10),
      mdPicks: allMdPicks.slice(0, 10),
      weeklyProducts: allWeeklyProducts.slice(0, 10),
      badameunProducts: allBadameunProducts.slice(0, 10),
      bongseonjangTv,
      bongcookProducts: allBongcookProducts.slice(0, 10),
      bottomBanners,
    };
    HomeDataService.homeCache.set(CACHE_KEY_BELOW_FOLD, result, HOME_CACHE_TTL_MS);
    return result;
  }

  static invalidateCache(): void {
    HomeDataService.homeCache.invalidateAll();
  }
}
