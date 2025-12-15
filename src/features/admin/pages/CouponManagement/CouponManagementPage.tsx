import { AdminLayout } from '../../layouts';
import { ConfirmDialog, Snackbar } from '../../components';
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
    isDeleteDialogOpen,
    isSnackbarOpen,
    snackbarMessage,
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
    handleCancelDelete,
    handleConfirmDelete,
    handleCloseSnackbar,
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
        onEdit={() => {
          if (viewingCoupon) {
            handleEditCoupon(viewingCoupon);
            handleCloseDetailDialog();
          }
        }}
        onDelete={() => {
          if (viewingCoupon) {
            handleDeleteCoupon(viewingCoupon.id);
            handleCloseDetailDialog();
          }
        }}
        getDiscountTypeLabel={getDiscountTypeLabel}
        getDiscountValueLabel={getDiscountValueLabel}
        getTargetLabel={getTargetLabel}
        getConditionLabel={getConditionLabel}
        getPeriodLabel={getPeriodLabel}
      />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="정말 삭제하시겠습니까?"
        subtitle="삭제된 쿠폰은 복구할 수 없습니다."
        cancelText="취소"
        confirmText="삭제"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      <Snackbar
        isOpen={isSnackbarOpen}
        title={snackbarMessage}
        onClose={handleCloseSnackbar}
      />
    </AdminLayout>
  );
}
