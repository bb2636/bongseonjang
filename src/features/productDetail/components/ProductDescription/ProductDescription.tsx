import './ProductDescription.css';

interface ProductDescriptionProps {
  description?: string;
  origin?: string;
  storageMethod?: string;
  expirationInfo?: string;
  shippingFee: number;
  shippingMethod?: string;
  shippingRegion?: string;
  notice?: string;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function ProductDescription({
  description,
  origin,
  storageMethod,
  expirationInfo,
  shippingFee,
  shippingMethod,
  shippingRegion,
  notice,
}: ProductDescriptionProps) {
  return (
    <div className="product-description">
      <div className="product-description__section">
        <div className="product-description__header">
          <h3 className="product-description__title">상품정보</h3>
        </div>
        <div className="product-description__info-list">
          {origin && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">원산지</span>
              <span className="product-description__info-value">{origin}</span>
            </div>
          )}
          {storageMethod && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">보관방법</span>
              <span className="product-description__info-value">{storageMethod}</span>
            </div>
          )}
          {expirationInfo && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">유통기한</span>
              <span className="product-description__info-value">{expirationInfo}</span>
            </div>
          )}
        </div>
      </div>

      <div className="product-description__section">
        <div className="product-description__header">
          <h3 className="product-description__title">배송정보</h3>
        </div>
        <div className="product-description__info-list">
          <div className="product-description__info-item">
            <span className="product-description__info-label">배송비</span>
            <span className="product-description__info-value">
              {shippingFee === 0 ? '무료배송' : `${formatPrice(shippingFee)}원`}
            </span>
          </div>
          {shippingMethod && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">배송방법</span>
              <span className="product-description__info-value">{shippingMethod}</span>
            </div>
          )}
          {shippingRegion && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">배송지역</span>
              <span className="product-description__info-value">{shippingRegion}</span>
            </div>
          )}
        </div>
      </div>

      {description && (
        <div className="product-description__section">
          <h3 className="product-description__title">상품 상세</h3>
          <div 
            className="product-description__content"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}

      {notice && (
        <div className="product-description__section">
          <h3 className="product-description__title">안내사항</h3>
          <p className="product-description__notice">{notice}</p>
        </div>
      )}
    </div>
  );
}
