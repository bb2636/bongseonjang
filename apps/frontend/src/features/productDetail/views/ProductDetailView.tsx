import ProductImageSlider from '../components/ProductImageSlider';
import ProductInfo from '../components/ProductInfo';
import ProductBenefits from '../components/ProductBenefits';
import ProductDescription from '../components/ProductDescription';
import ProductDetailContent from '../components/ProductDetailContent';
import RelatedProducts from '../components/RelatedProducts';
import ReviewSection from '../components/ReviewSection';
import BottomActionBar from '../components/BottomActionBar';
import DetailAppBar from '../components/DetailAppBar';
import ProductDetailTabs from '../components/ProductDetailTabs';
import CountdownTimer from '../components/CountdownTimer';
import { ProductInquirySection } from '../components/ProductInquirySection';
import type { TabType } from '../components/ProductDetailTabs';
import type { ProductDetail, Review } from '../types/productDetail';
import type { RelatedProduct } from '../api/productDetailApi';
import type { ProductInquiry } from '../types/productInquiry';
import './ProductDetailView.css';

interface ProductDetailViewProps {
  product: ProductDetail;
  activeTab: TabType;
  reviews: Review[];
  reviewsLoading: boolean;
  inquiries: ProductInquiry[];
  inquiriesLoading: boolean;
  relatedProducts: RelatedProduct[];
  relatedProductsLoading: boolean;
  isWishlisted: boolean;
  isSoldOut: boolean;
  onShare: () => void;
  onTabChange: (tab: TabType) => void;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: () => void;
  onWriteReviewClick: () => void;
  onWriteInquiryClick: () => void;
}

export default function ProductDetailView({
  product,
  activeTab,
  reviews,
  reviewsLoading,
  inquiries,
  inquiriesLoading,
  relatedProducts,
  relatedProductsLoading,
  isWishlisted,
  isSoldOut,
  onShare,
  onTabChange,
  onAddToCart,
  onToggleWishlist,
  onWriteReviewClick,
  onWriteInquiryClick,
}: ProductDetailViewProps) {
  const sliderImages = product.images.filter(
    (img) => img.imageType === 'THUMBNAIL' || img.imageType === 'GALLERY'
  );
  const detailImages = product.images.filter(
    (img) => img.imageType === 'DETAIL'
  );

  return (
    <div className="product-detail-view">
      <DetailAppBar productName={product.name} />
      
      <div className="product-detail-view__content">
        <ProductDetailTabs
          activeTab={activeTab}
          reviewCount={product.reviewCount}
          onTabChange={onTabChange}
        />

        {activeTab === 'info' && (
          <>
            <ProductImageSlider
              images={sliderImages}
              thumbnailUrl={product.thumbnailUrl}
            />

            <CountdownTimer saleStartAt={product.saleStartAt} saleEndAt={product.saleEndAt} />
          </>
        )}

        {activeTab === 'info' && (
          <>
            <ProductInfo
              name={product.name}
              basePrice={product.basePrice}
              discountedPrice={product.discountedPrice}
              discountRate={product.discountRate}
              isDiscounted={product.isDiscounted}
              reviewCount={product.reviewCount}
              averageRating={product.averageRating}
              onShare={onShare}
              onReviewClick={() => onTabChange('review')}
            />

            <ProductBenefits
              points={Math.floor(product.discountedPrice * 0.01)}
              notice={product.notice}
            />

            <ProductDescription
              description={product.description}
              weight={product.weight}
              origin={product.origin}
              storageMethod={product.storageMethod}
              expirationInfo={product.expirationInfo}
              shippingMethod={product.shippingMethod}
              shippingRegion={product.shippingRegion}
              shippingFee={product.shippingFee}
              notice={product.notice}
              productInfos={product.productInfos}
              shippingDetails={product.shippingDetails}
            />

            <ProductDetailContent images={detailImages} />

            <RelatedProducts 
              products={relatedProducts}
              isLoading={relatedProductsLoading}
              onAddToCart={onAddToCart}
            />
          </>
        )}

        {activeTab === 'review' && (
          <ReviewSection
            reviewCount={product.reviewCount}
            averageRating={product.averageRating}
            reviews={reviews}
            isLoading={reviewsLoading}
            onWriteReviewClick={onWriteReviewClick}
          />
        )}

        {activeTab === 'inquiry' && (
          <div className="product-detail-view__inquiry">
            {inquiriesLoading ? (
              <div className="product-detail-view__spinner" />
            ) : (
              <ProductInquirySection
                inquiries={inquiries}
                onCreateInquiry={onWriteInquiryClick}
              />
            )}
          </div>
        )}
      </div>

      <BottomActionBar
        productId={product.id}
        isWishlisted={isWishlisted}
        isSoldOut={isSoldOut}
        onToggleWishlist={onToggleWishlist}
      />
    </div>
  );
}
