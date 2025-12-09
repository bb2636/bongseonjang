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
import type { ReferralRepository } from '../features/referral/repository/ReferralRepository';
import type { HeroImageRepository } from '../features/home/repository/HeroImageRepository';
import type { TimeDealRepository } from '../features/timeDeal/repository/TimeDealRepository';
import type { BestProductRepository } from '../features/bestProduct/repository/BestProductRepository';
import type { MiddleBannerRepository } from '../features/middleBanner/repository/MiddleBannerRepository';
import type { FreshFoodRepository } from '../features/freshFood/repository/FreshFoodRepository';

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
}

const config: RepositoryConfig = {
  referral: REPOSITORY_TYPE.MOCK,
  heroImage: REPOSITORY_TYPE.MOCK,
  timeDeal: REPOSITORY_TYPE.MOCK,
  bestProduct: REPOSITORY_TYPE.MOCK,
  middleBanner: REPOSITORY_TYPE.MOCK,
  freshFood: REPOSITORY_TYPE.MOCK,
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
};
