import type { PhoneVerificationService } from '../domain/PhoneVerificationService.js';
import { MockPhoneVerificationService } from './MockPhoneVerificationService.js';
import { SolapiPhoneVerificationService } from './SolapiPhoneVerificationService.js';

let instance: PhoneVerificationService | null = null;

function isSolapiConfigured(): boolean {
  return Boolean(
    process.env.SOLAPI_API_KEY &&
    process.env.SOLAPI_API_SECRET &&
    process.env.SOLAPI_SENDER_PHONE
  );
}

export function getPhoneVerificationService(): PhoneVerificationService {
  if (!instance) {
    if (isSolapiConfigured()) {
      console.log('[PhoneVerification] Solapi 서비스 활성화됨');
      instance = new SolapiPhoneVerificationService();
    } else {
      console.log('[PhoneVerification] Mock 서비스 사용 (개발 모드)');
      instance = new MockPhoneVerificationService();
    }
  }
  return instance;
}
