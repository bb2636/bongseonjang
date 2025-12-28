import { AdminLayout } from '../../layouts';
import { useProductManagement } from './useProductManagement';
import { ProductManagementView } from './ProductManagementView';
import { ProductFormDialog } from './ProductFormDialog';

export function ProductManagementPage() {
  const {
    products,
    totalCount,
    isLoading,
    error,
    searchQuery,
    isFormDialogOpen,
    selectedProduct,
    onSearchChange,
    onAddProduct,
    onCloseFormDialog,
    onFormSuccess,
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
      <ProductFormDialog
        isOpen={isFormDialogOpen}
        onClose={onCloseFormDialog}
        onSuccess={onFormSuccess}
        productId={selectedProduct?.id}
      />
    </AdminLayout>
  );
}
