import { useCouponPage } from '../hooks/useCouponPage';
import CouponView from '../views/CouponView';

export default function CouponPage() {
  const {
    coupons,
    totalCount,
    isLoading,
    isIssuing,
    onBack,
    onIssueCoupon,
  } = useCouponPage();

  return (
    <CouponView
      coupons={coupons}
      totalCount={totalCount}
      isLoading={isLoading}
      isIssuing={isIssuing}
      onBack={onBack}
      onIssueCoupon={onIssueCoupon}
    />
  );
}
