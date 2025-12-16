import './ProductDetailTabs.css';

export type TabType = 'info' | 'review' | 'inquiry';

interface ProductDetailTabsProps {
  activeTab: TabType;
  reviewCount: number;
  onTabChange: (tab: TabType) => void;
}

export default function ProductDetailTabs({
  activeTab,
  reviewCount,
  onTabChange,
}: ProductDetailTabsProps) {
  return (
    <div className="product-detail-tabs">
      <button
        className={`product-detail-tabs__tab ${activeTab === 'info' ? 'product-detail-tabs__tab--active' : ''}`}
        onClick={() => onTabChange('info')}
      >
        <span className="product-detail-tabs__tab-text">상품정보</span>
      </button>

      <button
        className={`product-detail-tabs__tab ${activeTab === 'review' ? 'product-detail-tabs__tab--active' : ''}`}
        onClick={() => onTabChange('review')}
      >
        <span className="product-detail-tabs__tab-text">후기</span>
        <span className={`product-detail-tabs__tab-count ${activeTab === 'review' ? 'product-detail-tabs__tab-count--active' : ''}`}>
          {reviewCount}
        </span>
      </button>

      <button
        className={`product-detail-tabs__tab ${activeTab === 'inquiry' ? 'product-detail-tabs__tab--active' : ''}`}
        onClick={() => onTabChange('inquiry')}
      >
        <span className="product-detail-tabs__tab-text">문의</span>
      </button>
    </div>
  );
}
