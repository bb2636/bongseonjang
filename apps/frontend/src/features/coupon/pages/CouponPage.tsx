import { useCouponPage } from '../hooks/useCouponPage';
import { CouponDownloadPage } from '../components';

export default function CouponPage() {
  const { state, actions } = useCouponPage();

  return (
    <CouponDownloadPage
      coupons={state.coupons}
      totalCount={state.totalCount}
      isLoading={state.isLoading}
      isIssuing={state.isIssuing}
      onClose={actions.onBack}
      onIssueCoupon={actions.onIssueCoupon}
    />
  );
}
