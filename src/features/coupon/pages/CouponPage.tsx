import { useCouponPage } from '../hooks/useCouponPage';
import { CouponDownloadBottomSheet } from '../components';

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
    <CouponDownloadBottomSheet
      isOpen={true}
      coupons={coupons}
      totalCount={totalCount}
      isLoading={isLoading}
      isIssuing={isIssuing}
      onClose={onBack}
      onIssueCoupon={onIssueCoupon}
    />
  );
}
