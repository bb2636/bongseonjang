import type { PhoneVerificationService } from '../domain/PhoneVerificationService';
import { MockPhoneVerificationService } from './MockPhoneVerificationService';

let instance: PhoneVerificationService | null = null;

export function getPhoneVerificationService(): PhoneVerificationService {
  if (!instance) {
    instance = new MockPhoneVerificationService();
  }
  return instance;
}
