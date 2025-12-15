import { AdminLayout } from '../../layouts';
import { useProductManagement } from './useProductManagement';
import { ProductManagementView } from './ProductManagementView';

export function ProductManagementPage() {
  const {
    products,
    totalCount,
    isLoading,
    error,
    searchQuery,
    onSearchChange,
    onAddProduct,
    onViewProduct,
    formatPrice,
    getExposureLabel,
  } = useProductManagement();

  return (
    <AdminLayout
      title="상품 관리"
      description="봉선장의 상품을 등록하고 관리합니다"
    >
      <ProductManagementView
        products={products}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onAddProduct={onAddProduct}
        onViewProduct={onViewProduct}
        formatPrice={formatPrice}
        getExposureLabel={getExposureLabel}
      />
    </AdminLayout>
  );
}
