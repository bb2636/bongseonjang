import { useMyCouponPage } from '../hooks/useMyCouponPage';
import { MyCouponPage as MyCouponPageView } from '../components';

export default function MyCouponPage() {
  const { state, actions } = useMyCouponPage();

  return (
    <MyCouponPageView
      coupons={state.coupons}
      totalCount={state.totalCount}
      isLoading={state.isLoading}
      onBack={actions.onBack}
      onGoToDownload={actions.onGoToDownload}
    />
  );
}
