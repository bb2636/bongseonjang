import { MockReferralRepository } from '../repository/MockReferralRepository';
import { TypeORMReferralRepository } from '../repository/TypeORMReferralRepository';
import type { ReferralRepository } from '../repository/ReferralRepository';

export const REPOSITORY_TYPE = {
  MOCK: 'mock',
  REAL: 'real',
} as const;

type RepositoryType = typeof REPOSITORY_TYPE[keyof typeof REPOSITORY_TYPE];

interface RepositoryConfig {
  referral: RepositoryType;
}

const config: RepositoryConfig = {
  referral: REPOSITORY_TYPE.MOCK,
};

type RepositoryFactory<T> = {
  [REPOSITORY_TYPE.MOCK]: () => T;
  [REPOSITORY_TYPE.REAL]: () => T;
};

const repositoryMap: {
  referral: RepositoryFactory<ReferralRepository>;
} = {
  referral: {
    [REPOSITORY_TYPE.MOCK]: () => new MockReferralRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMReferralRepository(),
  },
};

export const repositories = {
  referral: repositoryMap.referral[config.referral](),
};
