import { Banner, BannerTab } from './useBannerManagement';
import './BannerManagement.css';

interface BannerManagementViewProps {
  tabs: BannerTab[];
  activeTab: string;
  banners: Banner[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  onTabChange: (tabCode: string) => void;
  onAddBanner: () => void;
  onEditBanner: (bannerId: number) => void;
  getPositionName: (positionCode: string) => string;
}

export function BannerManagementView({
  tabs,
  activeTab,
  banners,
  totalCount,
  isLoading,
  error,
  onTabChange,
  onAddBanner,
  onEditBanner,
  getPositionName,
}: BannerManagementViewProps) {
  const getActiveTabName = () => {
    const tab = tabs.find(t => t.code === activeTab);
    return tab?.name || '';
  };

  const renderBannerStatus = (banner: Banner) => {
    const now = new Date();
    const startDate = banner.startedAt ? new Date(banner.startedAt) : null;
    const endDate = banner.endedAt ? new Date(banner.endedAt) : null;

    const isWithinDateRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
    const isActive = banner.isActive && isWithinDateRange;

    return (
      <span className={`banner-table__status ${isActive ? 'banner-table__status--active' : 'banner-table__status--inactive'}`}>
        {isActive ? '노출중' : '비노출'}
      </span>
    );
  };

  return (
    <div className="banner-management">
      <div className="banner-management__header">
        <button className="banner-management__add-button" onClick={onAddBanner}>
          배너 등록
        </button>
      </div>

      <div className="banner-management__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.code}
            className={`banner-management__tab ${activeTab === tab.code ? 'banner-management__tab--active' : ''}`}
            onClick={() => onTabChange(tab.code)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="banner-management__stats">
        <span className="banner-management__stats-label">총 배너 수</span>
        <span className="banner-management__stats-label">·</span>
        <span className="banner-management__stats-value">{totalCount}</span>
      </div>

      {error && (
        <div className="banner-table__empty">
          <p className="banner-table__empty-message">{error}</p>
        </div>
      )}

      {!error && (
        <table className="banner-table">
          <thead className="banner-table__header">
            <tr className="banner-table__header-row">
              <th className="banner-table__header-cell banner-table__header-cell--order">순서</th>
              <th className="banner-table__header-cell banner-table__header-cell--preview">미리보기</th>
              <th className="banner-table__header-cell banner-table__header-cell--name">배너명</th>
              <th className="banner-table__header-cell banner-table__header-cell--link">링크</th>
              <th className="banner-table__header-cell banner-table__header-cell--position">위치</th>
              <th className="banner-table__header-cell banner-table__header-cell--status">상태</th>
              <th className="banner-table__header-cell banner-table__header-cell--action">관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="banner-table__body-row">
                <td colSpan={7} className="banner-table__cell" style={{ textAlign: 'center' }}>
                  로딩 중...
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr className="banner-table__body-row">
                <td colSpan={7} className="banner-table__empty">
                  <p className="banner-table__empty-message">
                    등록된 배너가 없습니다.
                  </p>
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="banner-table__body-row">
                  <td className="banner-table__cell">
                    <div className="banner-table__drag-handle">
                      <div className="banner-table__drag-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </td>
                  <td className="banner-table__cell">
                    <div className="banner-table__thumbnail-wrapper">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title || '배너 이미지'}
                          className="banner-table__thumbnail"
                        />
                      ) : (
                        <div className="banner-table__thumbnail banner-table__thumbnail--placeholder">
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="banner-table__cell">
                    <span className="banner-table__name">{banner.title || '제목 없음'}</span>
                  </td>
                  <td className="banner-table__cell">
                    <span className="banner-table__link">{banner.linkUrl || '-'}</span>
                  </td>
                  <td className="banner-table__cell">
                    <span className="banner-table__position">{getActiveTabName()}</span>
                  </td>
                  <td className="banner-table__cell">
                    {renderBannerStatus(banner)}
                  </td>
                  <td className="banner-table__cell">
                    <button
                      className="banner-table__edit-button"
                      onClick={() => onEditBanner(banner.id)}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
