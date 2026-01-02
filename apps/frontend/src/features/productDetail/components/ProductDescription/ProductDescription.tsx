import './ProductDescription.css';

interface ProductDescriptionProps {
  description?: string;
  weight?: string;
  origin?: string;
  storageMethod?: string;
  expirationInfo?: string;
  shippingMethod?: string;
  shippingRegion?: string;
  shippingFee?: number;
  notice?: string;
  productInfos?: Array<{ label: string; value: string }>;
  shippingDetails?: Array<{ label: string; value: string }>;
}

export default function ProductDescription({
  description,
  weight,
  origin,
  storageMethod,
  expirationInfo,
  shippingMethod,
  shippingRegion,
  shippingFee = 3500,
  notice,
  productInfos = [],
  shippingDetails = [],
}: ProductDescriptionProps) {
  return (
    <div className="product-description">
      <div className="product-description__section">
        <div className="product-description__header">
          <h3 className="product-description__title">상품정보</h3>
        </div>
        <div className="product-description__info-list">
          {weight && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">중량</span>
              <span className="product-description__info-value">{weight}</span>
            </div>
          )}
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
          {productInfos.map((info, index) => (
            <div key={index} className="product-description__info-item">
              <span className="product-description__info-label">{info.label}</span>
              <span className="product-description__info-value">{info.value}</span>
            </div>
          ))}
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
              {shippingFee === 0 ? '무료배송' : `${shippingFee.toLocaleString('ko-KR')}원 (배송비 선불)`}
            </span>
          </div>
          {shippingMethod && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">배송방법</span>
              <span className="product-description__info-value">{shippingMethod}</span>
            </div>
          )}
          {expirationInfo && (
            <div className="product-description__info-item">
              <span className="product-description__info-label">유통기한</span>
              <span className="product-description__info-value">{expirationInfo}</span>
            </div>
          )}
          {shippingDetails.map((detail, index) => (
            <div key={index} className="product-description__info-item">
              <span className="product-description__info-label">{detail.label}</span>
              <span className="product-description__info-value">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      {description && (
        <div className="product-description__section">
          <div className="product-description__header">
            <h3 className="product-description__title">상품설명</h3>
          </div>
          <p className="product-description__text">{description}</p>
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
