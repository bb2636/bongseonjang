import { AdminLayout } from '../../layouts';
import { useReviewManagement } from './useReviewManagement';
import { ReviewManagementView } from './ReviewManagementView';
import { ReviewDetailPanel } from './ReviewDetailPanel';

export function ReviewManagementPage() {
  const {
    reviews,
    totalCount,
    isLoading,
    error,
    searchQuery,
    ratingFilter,
    onSearchChange,
    onRatingFilterChange,
    onViewReview,
    onDeleteReview,
    formatDate,
    selectedReviewId,
    isDetailPanelOpen,
    onCloseDetailPanel,
  } = useReviewManagement();

  return (
    <AdminLayout
      title="리뷰 관리"
      description="상품 리뷰를 관리합니다"
    >
      <ReviewManagementView
        reviews={reviews}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        ratingFilter={ratingFilter}
        onSearchChange={onSearchChange}
        onRatingFilterChange={onRatingFilterChange}
        onViewReview={onViewReview}
        onDeleteReview={onDeleteReview}
        formatDate={formatDate}
      />
      {selectedReviewId && (
        <ReviewDetailPanel
          reviewId={selectedReviewId}
          isOpen={isDetailPanelOpen}
          onClose={onCloseDetailPanel}
          onDelete={onDeleteReview}
        />
      )}
    </AdminLayout>
  );
}
