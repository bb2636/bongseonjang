import { MockReferralRepository } from '../features/referral/repository/MockReferralRepository';
import { TypeORMReferralRepository } from '../features/referral/repository/TypeORMReferralRepository';
import { MockHeroImageRepository } from '../features/home/repository/MockHeroImageRepository';
import { TypeORMHeroImageRepository } from '../features/home/repository/TypeORMHeroImageRepository';
import type { ReferralRepository } from '../features/referral/repository/ReferralRepository';
import type { HeroImageRepository } from '../features/home/repository/HeroImageRepository';

export const REPOSITORY_TYPE = {
  MOCK: 'mock',
  REAL: 'real',
} as const;

type RepositoryType = typeof REPOSITORY_TYPE[keyof typeof REPOSITORY_TYPE];

interface RepositoryConfig {
  referral: RepositoryType;
  heroImage: RepositoryType;
}

const config: RepositoryConfig = {
  referral: REPOSITORY_TYPE.MOCK,
  heroImage: REPOSITORY_TYPE.MOCK,
};

type RepositoryFactory<T> = {
  [REPOSITORY_TYPE.MOCK]: () => T;
  [REPOSITORY_TYPE.REAL]: () => T;
};

interface RepositoryMap {
  referral: RepositoryFactory<ReferralRepository>;
  heroImage: RepositoryFactory<HeroImageRepository>;
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
};
