import { BestProductService } from '../../bestProduct/application/BestProductService';
import { BongseonjangTvService } from '../../bongseonjangTv/application/BongseonjangTvService';
import { ProductService } from '../../product/application/ProductService';
import { bannerRepository } from '../../banner/repository/bannerRepository';
import { repositories } from '../../../config/repositories';
import { TypeORMProductRepository } from '../../product/repository/TypeORMProductRepository';
import { ReviewService, TypeORMReviewRepository, TypeORMReviewImageRepository } from '../../review';
import { TypeORMReviewableOrderItemRepository } from '../../review/repository/TypeORMReviewableOrderItemRepository';

export interface HomeDataResponse {
  heroImages: Array<{ id: number; imageUrl: string; linkUrl: string | null }>;
  timeDeals: Array<any>;
  bestProducts: Array<any>;
  middleBanners: Array<{ id: number; imageUrl: string; linkUrl: string | null }>;
  freshProducts: Array<any>;
  mdPicks: Array<any>;
  badameunProducts: Array<any>;
  bongseonjangTv: Array<any>;
  bongcookProducts: Array<any>;
  bottomBanners: Array<{ id: number; imageUrl: string; linkUrl: string | null }>;
}

export class HomeDataService {
  private bestProductService: BestProductService;
  private bongseonjangTvService: BongseonjangTvService;
  private productService: ProductService;

  constructor() {
    this.bestProductService = new BestProductService(repositories.bestProduct);
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
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? null,
    }));
  }

  async getHomeData(): Promise<HomeDataResponse> {
    const [
      heroImages,
      timeDeals,
      bestProducts,
      middleBanners,
      freshProducts,
      mdPicks,
      badameunProducts,
      bongseonjangTv,
      bongcookProducts,
      bottomBanners,
    ] = await Promise.all([
      this.getBannersByPosition('HOME_HERO'),
      this.productService.getTimeDeals(10),
      this.bestProductService.getBestProducts(),
      this.getBannersByPosition('HOME_MIDDLE'),
      this.productService.getFreshProducts(10),
      this.productService.getProductsByTag('md_pick', 10),
      this.productService.getProductsByTag('badameun', 10),
      this.bongseonjangTvService.getAllImages(),
      this.productService.getProductsByTag('bongcook', 10),
      this.getBannersByPosition('HOME_BOTTOM'),
    ]);

    return {
      heroImages,
      timeDeals,
      bestProducts,
      middleBanners,
      freshProducts,
      mdPicks,
      badameunProducts,
      bongseonjangTv,
      bongcookProducts,
      bottomBanners,
    };
  }
}
