import { useCouponPage } from '../hooks/useCouponPage';
import { CouponDownloadPage as CouponDownloadPageView } from '../components';

export default function CouponDownloadPage() {
  const { state, actions } = useCouponPage();

  return (
    <CouponDownloadPageView
      coupons={state.coupons}
      totalCount={state.totalCount}
      isLoading={state.isLoading}
      isIssuing={state.isIssuing}
      onClose={actions.onBack}
      onIssueCoupon={actions.onIssueCoupon}
    />
  );
}
