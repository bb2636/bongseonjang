import { useGoBack } from '../../../hooks/useGoBack';

const EFFECTIVE_DATE = '2026년 6월 2일';
const COMPANY_NAME = '봉선장 (Bongseonjang Co., Ltd.)';
const PRIVACY_OFFICER_EMAIL = 'privacy@bongseonjang.com';

export function usePrivacyPolicyPage() {
  const goBack = useGoBack();

  return {
    state: {
      effectiveDate: EFFECTIVE_DATE,
      companyName: COMPANY_NAME,
      privacyOfficerEmail: PRIVACY_OFFICER_EMAIL,
    },
    actions: {
      onBack: goBack,
    },
  };
}
