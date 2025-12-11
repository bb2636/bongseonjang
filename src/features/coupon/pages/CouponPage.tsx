import { useCouponPage } from '../hooks/useCouponPage';
import { CouponDownloadPage } from '../components';

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
    <CouponDownloadPage
      coupons={coupons}
      totalCount={totalCount}
      isLoading={isLoading}
      isIssuing={isIssuing}
      onClose={onBack}
      onIssueCoupon={onIssueCoupon}
    />
  );
}
