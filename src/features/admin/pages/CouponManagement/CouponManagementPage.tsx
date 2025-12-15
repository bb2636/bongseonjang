import { AdminLayout } from '../../layouts';
import { CouponManagementView } from './CouponManagementView';
import { CouponFormDialog } from './CouponFormDialog';
import { CouponDetailDialog } from './CouponDetailDialog';
import { useCouponManagement } from './useCouponManagement';

export function CouponManagementPage() {
  const {
    coupons,
    totalCount,
    isLoading,
    error,
    searchQuery,
    discountFilter,
    isFormDialogOpen,
    editingCoupon,
    isDetailDialogOpen,
    viewingCoupon,
    handleSearchChange,
    handleFilterChange,
    handleAddCoupon,
    handleViewCoupon,
    handleEditCoupon,
    handleCloseFormDialog,
    handleCloseDetailDialog,
    handleFormSuccess,
    handleToggleStatus,
    handleDeleteCoupon,
    getDiscountTypeLabel,
    getDiscountValueLabel,
    getTargetLabel,
    getConditionLabel,
    getPeriodLabel,
  } = useCouponManagement();

  return (
    <AdminLayout
      title="쿠폰관리"
      description="쿠폰을 생성하고 관리합니다"
    >
      <CouponManagementView
        coupons={coupons}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        discountFilter={discountFilter}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onAddCoupon={handleAddCoupon}
        onViewCoupon={handleViewCoupon}
        onEditCoupon={handleEditCoupon}
        onToggleStatus={handleToggleStatus}
        onDeleteCoupon={handleDeleteCoupon}
        getDiscountTypeLabel={getDiscountTypeLabel}
        getDiscountValueLabel={getDiscountValueLabel}
        getTargetLabel={getTargetLabel}
        getConditionLabel={getConditionLabel}
        getPeriodLabel={getPeriodLabel}
      />
      <CouponFormDialog
        isOpen={isFormDialogOpen}
        coupon={editingCoupon}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
      />
      <CouponDetailDialog
        isOpen={isDetailDialogOpen}
        coupon={viewingCoupon}
        onClose={handleCloseDetailDialog}
        getDiscountTypeLabel={getDiscountTypeLabel}
        getDiscountValueLabel={getDiscountValueLabel}
        getTargetLabel={getTargetLabel}
        getConditionLabel={getConditionLabel}
        getPeriodLabel={getPeriodLabel}
      />
    </AdminLayout>
  );
}
