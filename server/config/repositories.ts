import { MockReferralRepository } from '../features/referral/repository/MockReferralRepository';
import { TypeORMReferralRepository } from '../features/referral/repository/TypeORMReferralRepository';
import { MockHeroImageRepository } from '../features/home/repository/MockHeroImageRepository';
import { TypeORMHeroImageRepository } from '../features/home/repository/TypeORMHeroImageRepository';
import { MockTimeDealRepository } from '../features/timeDeal/repository/MockTimeDealRepository';
import { TypeORMTimeDealRepository } from '../features/timeDeal/repository/TypeORMTimeDealRepository';
import type { ReferralRepository } from '../features/referral/repository/ReferralRepository';
import type { HeroImageRepository } from '../features/home/repository/HeroImageRepository';
import type { TimeDealRepository } from '../features/timeDeal/repository/TimeDealRepository';

export const REPOSITORY_TYPE = {
  MOCK: 'mock',
  REAL: 'real',
} as const;

type RepositoryType = typeof REPOSITORY_TYPE[keyof typeof REPOSITORY_TYPE];

interface RepositoryConfig {
  referral: RepositoryType;
  heroImage: RepositoryType;
  timeDeal: RepositoryType;
}

const config: RepositoryConfig = {
  referral: REPOSITORY_TYPE.MOCK,
  heroImage: REPOSITORY_TYPE.MOCK,
  timeDeal: REPOSITORY_TYPE.MOCK,
};

type RepositoryFactory<T> = {
  [REPOSITORY_TYPE.MOCK]: () => T;
  [REPOSITORY_TYPE.REAL]: () => T;
};

interface RepositoryMap {
  referral: RepositoryFactory<ReferralRepository>;
  heroImage: RepositoryFactory<HeroImageRepository>;
  timeDeal: RepositoryFactory<TimeDealRepository>;
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
};
