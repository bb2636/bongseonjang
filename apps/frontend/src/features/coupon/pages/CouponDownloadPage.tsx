import { useCouponPage } from '../hooks/useCouponPage';
import { CouponDownloadPage as CouponDownloadPageView } from '../components';

export default function CouponDownloadPage() {
  const {
    coupons,
    totalCount,
    isLoading,
    isIssuing,
    onBack,
    onIssueCoupon,
  } = useCouponPage();

  return (
    <CouponDownloadPageView
      coupons={coupons}
      totalCount={totalCount}
      isLoading={isLoading}
      isIssuing={isIssuing}
      onClose={onBack}
      onIssueCoupon={onIssueCoupon}
    />
  );
}
