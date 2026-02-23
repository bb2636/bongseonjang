import { TabType, CategoryItem, DisplayCategoryItem, ProductCategoryItem } from './useCategoryManagement';
import './CategoryManagement.css';

interface CategoryManagementViewProps {
  activeTab: TabType;
  categories: CategoryItem[];
  isLoading: boolean;
  error: string | null;
  onChangeTab: (tab: TabType) => void;
  onAdd: () => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (id: string | number) => void;
}

const TABS: { key: TabType; label: string }[] = [
  { key: 'exposure', label: '노출 카테고리' },
  { key: 'display', label: '전시 카테고리' },
  { key: 'product', label: '상품 카테고리' },
];

function hasStatusField(cat: CategoryItem): cat is DisplayCategoryItem | ProductCategoryItem {
  return 'isActive' in cat;
}

export function CategoryManagementView({
  activeTab,
  categories,
  isLoading,
  error,
  onChangeTab,
  onAdd,
  onEdit,
  onDelete,
}: CategoryManagementViewProps) {
  const isExposureTab = activeTab === 'exposure';

  return (
    <div className="category-management">
      <div className="category-management__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`category-management__tab ${activeTab === tab.key ? 'category-management__tab--active' : ''}`}
            onClick={() => onChangeTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="category-management__toolbar">
        <div className="category-management__toolbar-left">
          <span className="category-management__total">총 카테고리 수</span>
          <span className="category-management__total-dot">·</span>
          <span className="category-management__total-count">{categories.length}</span>
        </div>
        <div className="category-management__toolbar-right">
          <button className="category-management__add-button" onClick={onAdd}>
            추가
          </button>
        </div>
      </div>

      {error && (
        <div className="category-table__error">
          <p className="category-table__error-message">{error}</p>
        </div>
      )}

      {!error && (
        <div className="category-table">
          <div className="category-table__header">
            <div className="category-table__header-row">
              <div className="category-table__header-cell category-table__header-cell--name">이름</div>
              <div className="category-table__header-cell category-table__header-cell--sort">정렬순서</div>
              {!isExposureTab && (
                <>
                  <div className="category-table__header-cell category-table__header-cell--status">상태</div>
                  <div className="category-table__header-cell category-table__header-cell--count">상품 수</div>
                </>
              )}
              <div className="category-table__header-cell category-table__header-cell--actions">관리</div>
            </div>
          </div>
          <div className="category-table__body">
            {isLoading ? (
              <div className="category-table__body-row category-table__body-row--loading">
                <div className="category-table__cell" style={{ flex: 1, textAlign: 'center' }}>
                  로딩 중...
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="category-table__empty">
                <p className="category-table__empty-message">등록된 카테고리가 없습니다.</p>
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="category-table__body-row">
                  <div className="category-table__cell category-table__cell--name">
                    <span className="category-table__name-text">{cat.name}</span>
                  </div>
                  <div className="category-table__cell category-table__cell--sort">
                    <span className="category-table__sort-text">{cat.sortOrder}</span>
                  </div>
                  {!isExposureTab && hasStatusField(cat) && (
                    <>
                      <div className="category-table__cell category-table__cell--status">
                        <span className={`category-table__status-dot ${cat.isActive ? 'category-table__status-dot--active' : 'category-table__status-dot--inactive'}`} />
                        <span className="category-table__status-text">{cat.isActive ? '활성' : '비활성'}</span>
                      </div>
                      <div className="category-table__cell category-table__cell--count">
                        <span className="category-table__count-text">{cat.productCount}개</span>
                      </div>
                    </>
                  )}
                  <div className="category-table__cell category-table__cell--actions">
                    <button className="category-table__action-button category-table__action-button--edit" onClick={() => onEdit(cat)}>
                      수정
                    </button>
                    <button className="category-table__action-button category-table__action-button--delete" onClick={() => onDelete(cat.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
