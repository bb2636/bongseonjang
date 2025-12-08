import { MockReferralRepository } from '../repository/MockReferralRepository';
import { TypeORMReferralRepository } from '../repository/TypeORMReferralRepository';
import { ReferralRepository } from '../repository/ReferralRepository';

type RepositoryType = 'mock' | 'real';

interface RepositoryConfig {
  referral: RepositoryType;
}

const config: RepositoryConfig = {
  referral: 'mock',
};

function createReferralRepository(): ReferralRepository {
  if (config.referral === 'real') {
    return new TypeORMReferralRepository();
  }
  return new MockReferralRepository();
}

export const repositories = {
  referral: createReferralRepository(),
};
