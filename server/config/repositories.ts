import { MockReferralRepository } from '../features/referral/repository/MockReferralRepository';
import { TypeORMReferralRepository } from '../features/referral/repository/TypeORMReferralRepository';
import { MockHeroImageRepository } from '../features/home/repository/MockHeroImageRepository';
import { TypeORMHeroImageRepository } from '../features/home/repository/TypeORMHeroImageRepository';
import { MockTimeDealRepository } from '../features/timeDeal/repository/MockTimeDealRepository';
import { TypeORMTimeDealRepository } from '../features/timeDeal/repository/TypeORMTimeDealRepository';
import { MockBestProductRepository } from '../features/bestProduct/repository/MockBestProductRepository';
import { TypeORMBestProductRepository } from '../features/bestProduct/repository/TypeORMBestProductRepository';
import { MockMiddleBannerRepository } from '../features/middleBanner/repository/MockMiddleBannerRepository';
import { TypeORMMiddleBannerRepository } from '../features/middleBanner/repository/TypeORMMiddleBannerRepository';
import { MockFreshFoodRepository } from '../features/freshFood/repository/MockFreshFoodRepository';
import { TypeORMFreshFoodRepository } from '../features/freshFood/repository/TypeORMFreshFoodRepository';
import { MockMdPickRepository } from '../features/mdPick/repository/MockMdPickRepository';
import { TypeORMMdPickRepository } from '../features/mdPick/repository/TypeORMMdPickRepository';
import { MockBadameunRepository } from '../features/badameun/repository/MockBadameunRepository';
import { TypeORMBadameunRepository } from '../features/badameun/repository/TypeORMBadameunRepository';
import { MockBongseonjangTvRepository } from '../features/bongseonjangTv/repository/MockBongseonjangTvRepository';
import { TypeORMBongseonjangTvRepository } from '../features/bongseonjangTv/repository/TypeORMBongseonjangTvRepository';
import { MockBongcookRepository } from '../features/bongcook/repository/MockBongcookRepository';
import { TypeORMBongcookRepository } from '../features/bongcook/repository/TypeORMBongcookRepository';
import { MockBottomBannerRepository } from '../features/bottomBanner/repository/MockBottomBannerRepository';
import { TypeORMBottomBannerRepository } from '../features/bottomBanner/repository/TypeORMBottomBannerRepository';
import type { ReferralRepository } from '../features/referral/repository/ReferralRepository';
import type { HeroImageRepository } from '../features/home/repository/HeroImageRepository';
import type { TimeDealRepository } from '../features/timeDeal/repository/TimeDealRepository';
import type { BestProductRepository } from '../features/bestProduct/repository/BestProductRepository';
import type { MiddleBannerRepository } from '../features/middleBanner/repository/MiddleBannerRepository';
import type { FreshFoodRepository } from '../features/freshFood/repository/FreshFoodRepository';
import type { MdPickRepository } from '../features/mdPick/repository/MdPickRepository';
import type { BadameunRepository } from '../features/badameun/repository/BadameunRepository';
import type { BongseonjangTvRepository } from '../features/bongseonjangTv/repository/BongseonjangTvRepository';
import type { BongcookRepository } from '../features/bongcook/repository/BongcookRepository';
import type { BottomBannerRepository } from '../features/bottomBanner/repository/BottomBannerRepository';

export const REPOSITORY_TYPE = {
  MOCK: 'mock',
  REAL: 'real',
} as const;

type RepositoryType = typeof REPOSITORY_TYPE[keyof typeof REPOSITORY_TYPE];

interface RepositoryConfig {
  referral: RepositoryType;
  heroImage: RepositoryType;
  timeDeal: RepositoryType;
  bestProduct: RepositoryType;
  middleBanner: RepositoryType;
  freshFood: RepositoryType;
  mdPick: RepositoryType;
  badameun: RepositoryType;
  bongseonjangTv: RepositoryType;
  bongcook: RepositoryType;
  bottomBanner: RepositoryType;
}

const config: RepositoryConfig = {
  referral: REPOSITORY_TYPE.MOCK,
  heroImage: REPOSITORY_TYPE.MOCK,
  timeDeal: REPOSITORY_TYPE.MOCK,
  bestProduct: REPOSITORY_TYPE.REAL,
  middleBanner: REPOSITORY_TYPE.MOCK,
  freshFood: REPOSITORY_TYPE.MOCK,
  mdPick: REPOSITORY_TYPE.MOCK,
  badameun: REPOSITORY_TYPE.MOCK,
  bongseonjangTv: REPOSITORY_TYPE.MOCK,
  bongcook: REPOSITORY_TYPE.MOCK,
  bottomBanner: REPOSITORY_TYPE.MOCK,
};

type RepositoryFactory<T> = {
  [REPOSITORY_TYPE.MOCK]: () => T;
  [REPOSITORY_TYPE.REAL]: () => T;
};

interface RepositoryMap {
  referral: RepositoryFactory<ReferralRepository>;
  heroImage: RepositoryFactory<HeroImageRepository>;
  timeDeal: RepositoryFactory<TimeDealRepository>;
  bestProduct: RepositoryFactory<BestProductRepository>;
  middleBanner: RepositoryFactory<MiddleBannerRepository>;
  freshFood: RepositoryFactory<FreshFoodRepository>;
  mdPick: RepositoryFactory<MdPickRepository>;
  badameun: RepositoryFactory<BadameunRepository>;
  bongseonjangTv: RepositoryFactory<BongseonjangTvRepository>;
  bongcook: RepositoryFactory<BongcookRepository>;
  bottomBanner: RepositoryFactory<BottomBannerRepository>;
}

const repositoryMap: RepositoryMap = {
  referral: {
    [REPOSITORY_TYPE.MOCK]: () => new MockReferralRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMReferralRepository(),
  },
  heroImage: {
    [REPOSITORY_TYPE.MOCK]: () => new MockHeroImageRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMHeroImageRepository(),
  },
  timeDeal: {
    [REPOSITORY_TYPE.MOCK]: () => new MockTimeDealRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMTimeDealRepository(),
  },
  bestProduct: {
    [REPOSITORY_TYPE.MOCK]: () => new MockBestProductRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMBestProductRepository(),
  },
  middleBanner: {
    [REPOSITORY_TYPE.MOCK]: () => new MockMiddleBannerRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMMiddleBannerRepository(),
  },
  freshFood: {
    [REPOSITORY_TYPE.MOCK]: () => new MockFreshFoodRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMFreshFoodRepository(),
  },
  mdPick: {
    [REPOSITORY_TYPE.MOCK]: () => new MockMdPickRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMMdPickRepository(),
  },
  badameun: {
    [REPOSITORY_TYPE.MOCK]: () => new MockBadameunRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMBadameunRepository(),
  },
  bongseonjangTv: {
    [REPOSITORY_TYPE.MOCK]: () => new MockBongseonjangTvRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMBongseonjangTvRepository(),
  },
  bongcook: {
    [REPOSITORY_TYPE.MOCK]: () => new MockBongcookRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMBongcookRepository(),
  },
  bottomBanner: {
    [REPOSITORY_TYPE.MOCK]: () => new MockBottomBannerRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMBottomBannerRepository(),
  },
};

const instances = new Map<keyof RepositoryConfig, unknown>();

function createRepository<T>(name: keyof RepositoryConfig): T {
  const cached = instances.get(name);
  if (cached) {
    return cached as T;
  }

  const factory = repositoryMap[name][config[name]];
  const instance = factory() as unknown;
  instances.set(name, instance);
  return instance as T;
}

export function resetRepositories(): void {
  instances.clear();
}

export const repositories = {
  get referral(): ReferralRepository {
    return createRepository<ReferralRepository>('referral');
  },
  get heroImage(): HeroImageRepository {
    return createRepository<HeroImageRepository>('heroImage');
  },
  get timeDeal(): TimeDealRepository {
    return createRepository<TimeDealRepository>('timeDeal');
  },
  get bestProduct(): BestProductRepository {
    return createRepository<BestProductRepository>('bestProduct');
  },
  get middleBanner(): MiddleBannerRepository {
    return createRepository<MiddleBannerRepository>('middleBanner');
  },
  get freshFood(): FreshFoodRepository {
    return createRepository<FreshFoodRepository>('freshFood');
  },
  get mdPick(): MdPickRepository {
    return createRepository<MdPickRepository>('mdPick');
  },
  get badameun(): BadameunRepository {
    return createRepository<BadameunRepository>('badameun');
  },
  get bongseonjangTv(): BongseonjangTvRepository {
    return createRepository<BongseonjangTvRepository>('bongseonjangTv');
  },
  get bongcook(): BongcookRepository {
    return createRepository<BongcookRepository>('bongcook');
  },
  get bottomBanner(): BottomBannerRepository {
    return createRepository<BottomBannerRepository>('bottomBanner');
  },
};
