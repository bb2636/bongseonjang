import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Banner, BannerTab } from './useBannerManagement';
import './BannerManagement.css';

interface BannerManagementViewProps {
  tabs: BannerTab[];
  activeTab: string;
  banners: Banner[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  reorderError: string | null;
  onTabChange: (tabCode: string) => void;
  onAddBanner: () => void;
  onEditBanner: (bannerId: number) => void;
  onReorderBanners: (activeId: number, overId: number) => void;
  onDismissReorderError: () => void;
  getPositionName: (positionCode: string) => string;
}

interface SortableBannerRowProps {
  banner: Banner;
  activeTabName: string;
  onEditBanner: (bannerId: number) => void;
  renderBannerStatus: (banner: Banner) => JSX.Element;
}

function SortableBannerRow({ banner, activeTabName, onEditBanner, renderBannerStatus }: SortableBannerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="banner-table__body-row">
      <div className="banner-table__cell banner-table__cell--order">
        <div className="banner-table__drag-handle" {...attributes} {...listeners}>
          <div className="banner-table__drag-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <div className="banner-table__cell banner-table__cell--preview">
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
      </div>
      <div className="banner-table__cell banner-table__cell--name">
        <span className="banner-table__name">{banner.title || '제목 없음'}</span>
      </div>
      <div className="banner-table__cell banner-table__cell--link">
        <span className="banner-table__link">{banner.linkUrl || '-'}</span>
      </div>
      <div className="banner-table__cell banner-table__cell--position">
        <span className="banner-table__position">{activeTabName}</span>
      </div>
      <div className="banner-table__cell banner-table__cell--status">
        {renderBannerStatus(banner)}
      </div>
      <div className="banner-table__cell banner-table__cell--action">
        <button
          className="banner-table__edit-button"
          onClick={() => onEditBanner(banner.id)}
        >
          수정
        </button>
      </div>
    </div>
  );
}

export function BannerManagementView({
  tabs,
  activeTab,
  banners,
  totalCount,
  isLoading,
  error,
  reorderError,
  onTabChange,
  onAddBanner,
  onEditBanner,
  onReorderBanners,
  onDismissReorderError,
  getPositionName,
}: BannerManagementViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      onReorderBanners(active.id as number, over.id as number);
    }
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

      {reorderError && (
        <div className="banner-management__toast banner-management__toast--error">
          <span className="banner-management__toast-message">{reorderError}</span>
          <button 
            className="banner-management__toast-dismiss" 
            onClick={onDismissReorderError}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="banner-table__empty">
          <p className="banner-table__empty-message">{error}</p>
        </div>
      )}

      {!error && (
        <div className="banner-table">
          <div className="banner-table__header">
            <div className="banner-table__header-row">
              <div className="banner-table__header-cell banner-table__header-cell--order">순서</div>
              <div className="banner-table__header-cell banner-table__header-cell--preview">미리보기</div>
              <div className="banner-table__header-cell banner-table__header-cell--name">배너명</div>
              <div className="banner-table__header-cell banner-table__header-cell--link">링크</div>
              <div className="banner-table__header-cell banner-table__header-cell--position">위치</div>
              <div className="banner-table__header-cell banner-table__header-cell--status">상태</div>
              <div className="banner-table__header-cell banner-table__header-cell--action">관리</div>
            </div>
          </div>
          <div className="banner-table__body">
            {isLoading ? (
              <div className="banner-table__body-row banner-table__body-row--loading">
                <div className="banner-table__cell" style={{ flex: 1, textAlign: 'center' }}>
                  로딩 중...
                </div>
              </div>
            ) : banners.length === 0 ? (
              <div className="banner-table__empty">
                <p className="banner-table__empty-message">
                  등록된 배너가 없습니다.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={banners.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {banners.map((banner) => (
                    <SortableBannerRow
                      key={banner.id}
                      banner={banner}
                      activeTabName={getActiveTabName()}
                      onEditBanner={onEditBanner}
                      renderBannerStatus={renderBannerStatus}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
