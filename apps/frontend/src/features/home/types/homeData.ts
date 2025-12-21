import type { HeroImage } from './heroImage';
import type { TimeDeal } from './timeDeal';
import type { BestProduct } from './bestProduct';
import type { MiddleBannerImage } from './middleBanner';
import type { FreshFood } from './freshFood';
import type { MdPickProduct } from './mdPick';
import type { BadameunProduct } from './badameun';
import type { BongseonjangTvImage } from './bongseonjangTv';
import type { BongcookProduct } from './bongcook';
import type { BottomBannerImage } from './bottomBanner';

export interface HomeData {
  heroImages: HeroImage[];
  timeDeals: TimeDeal[];
  bestProducts: BestProduct[];
  middleBanners: MiddleBannerImage[];
  freshProducts: FreshFood[];
  mdPicks: MdPickProduct[];
  badameunProducts: BadameunProduct[];
  bongseonjangTv: BongseonjangTvImage[];
  bongcookProducts: BongcookProduct[];
  bottomBanners: BottomBannerImage[];
}

export interface HomeDataResponse {
  success: boolean;
  data: HomeData;
}
