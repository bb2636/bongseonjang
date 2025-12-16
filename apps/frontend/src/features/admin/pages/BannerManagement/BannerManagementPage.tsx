import { AdminLayout } from '../../layouts';
import { BannerManagementView } from './BannerManagementView';
import { BannerFormDialog } from './BannerFormDialog';
import { useBannerManagement } from './useBannerManagement';

export function BannerManagementPage() {
  const {
    tabs,
    activeTab,
    banners,
    positions,
    totalCount,
    isLoading,
    error,
    reorderError,
    isFormDialogOpen,
    handleTabChange,
    handleAddBanner,
    handleEditBanner,
    handleReorderBanners,
    handleDismissReorderError,
    handleCloseFormDialog,
    handleFormSuccess,
    getPositionName,
  } = useBannerManagement();

  return (
    <AdminLayout
      title="배너 관리"
      description="등록된 배너의 정보와 현황을 관리합니다"
    >
      <BannerManagementView
        tabs={tabs}
        activeTab={activeTab}
        banners={banners}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        reorderError={reorderError}
        onTabChange={handleTabChange}
        onAddBanner={handleAddBanner}
        onEditBanner={handleEditBanner}
        onReorderBanners={handleReorderBanners}
        onDismissReorderError={handleDismissReorderError}
        getPositionName={getPositionName}
      />
      <BannerFormDialog
        isOpen={isFormDialogOpen}
        positions={positions}
        defaultPositionCode={activeTab}
        onClose={handleCloseFormDialog}
        onSuccess={handleFormSuccess}
      />
    </AdminLayout>
  );
}
