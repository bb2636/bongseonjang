import { useMyCouponPage } from '../hooks/useMyCouponPage';
import { MyCouponPage as MyCouponPageView } from '../components';

export default function MyCouponPage() {
  const {
    coupons,
    totalCount,
    isLoading,
    onBack,
    onGoToDownload,
  } = useMyCouponPage();

  return (
    <MyCouponPageView
      coupons={coupons}
      totalCount={totalCount}
      isLoading={isLoading}
      onBack={onBack}
      onGoToDownload={onGoToDownload}
    />
  );
}
