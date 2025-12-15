import { AdminLayout } from '../../layouts';
import { BannerManagementView } from './BannerManagementView';
import { useBannerManagement } from './useBannerManagement';

export function BannerManagementPage() {
  const {
    tabs,
    activeTab,
    banners,
    totalCount,
    isLoading,
    error,
    handleTabChange,
    handleAddBanner,
    handleEditBanner,
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
        onTabChange={handleTabChange}
        onAddBanner={handleAddBanner}
        onEditBanner={handleEditBanner}
        getPositionName={getPositionName}
      />
    </AdminLayout>
  );
}
