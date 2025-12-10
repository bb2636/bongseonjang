import ProductImageSlider from '../components/ProductImageSlider';
import ProductInfo from '../components/ProductInfo';
import ProductBenefits from '../components/ProductBenefits';
import ProductOptions from '../components/ProductOptions';
import ProductDescription from '../components/ProductDescription';
import ProductDetailContent from '../components/ProductDetailContent';
import RelatedProducts from '../components/RelatedProducts';
import ReviewSection from '../components/ReviewSection';
import BottomActionBar from '../components/BottomActionBar';
import DetailAppBar from '../components/DetailAppBar';
import ProductDetailTabs from '../components/ProductDetailTabs';
import OptionBottomSheet from '../components/OptionBottomSheet';
import type { SelectedItem } from '../components/OptionBottomSheet';
import type { TabType } from '../components/ProductDetailTabs';
import type { ProductDetail, ProductOption, Review } from '../types/productDetail';
import type { RelatedProduct } from '../api/productDetailApi';
import './ProductDetailView.css';

interface ProductDetailViewProps {
  product: ProductDetail;
  selectedOption: ProductOption | null;
  quantity: number;
  isWishlisted: boolean;
  totalPrice: number;
  activeTab: TabType;
  reviews: Review[];
  reviewsLoading: boolean;
  relatedProducts: RelatedProduct[];
  relatedProductsLoading: boolean;
  isBottomSheetOpen: boolean;
  onOptionSelect: (option: ProductOption) => void;
  onQuantityChange: (quantity: number) => void;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onBuyClick: () => void;
  onShare: () => void;
  onTabChange: (tab: TabType) => void;
  onAddToCart: (productId: string) => void;
  onBottomSheetClose: () => void;
  onOptionConfirm: (items: SelectedItem[]) => void;
}

export default function ProductDetailView({
  product,
  selectedOption,
  quantity,
  isWishlisted,
  totalPrice,
  activeTab,
  reviews,
  reviewsLoading,
  relatedProducts,
  relatedProductsLoading,
  isBottomSheetOpen,
  onOptionSelect,
  onQuantityChange,
  onWishlistClick,
  onCartClick,
  onBuyClick,
  onShare,
  onTabChange,
  onAddToCart,
  onBottomSheetClose,
  onOptionConfirm,
}: ProductDetailViewProps) {
  const sliderImages = product.images.filter(
    (img) => img.imageType === 'THUMBNAIL' || img.imageType === 'GALLERY'
  );
  const detailImages = product.images.filter(
    (img) => img.imageType === 'DETAIL'
  );

  return (
    <div className="product-detail-view">
      <DetailAppBar onCartClick={onCartClick} />
      
      <div className="product-detail-view__content">
        <ProductImageSlider
          images={sliderImages}
          thumbnailUrl={product.thumbnailUrl}
        />

        <ProductDetailTabs
          activeTab={activeTab}
          reviewCount={product.reviewCount}
          onTabChange={onTabChange}
        />

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
            />

            <ProductBenefits
              points={Math.floor(product.discountedPrice * 0.01)}
              shippingFee={product.shippingFee}
              notice={product.notice}
            />

            {product.mainOptions.length === 0 && product.options.length > 0 && (
              <ProductOptions
                options={product.options}
                selectedOption={selectedOption}
                quantity={quantity}
                onOptionSelect={onOptionSelect}
                onQuantityChange={onQuantityChange}
              />
            )}

            <ProductDescription
              description={product.description}
              origin={product.origin}
              storageMethod={product.storageMethod}
              expirationInfo={product.expirationInfo}
              shippingFee={product.shippingFee}
              shippingMethod={product.shippingMethod}
              shippingRegion={product.shippingRegion}
              notice={product.notice}
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
          />
        )}

        {activeTab === 'inquiry' && (
          <div className="product-detail-view__inquiry">
            <p className="product-detail-view__inquiry-text">문의 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>

      <BottomActionBar
        isWishlisted={isWishlisted}
        onWishlistClick={onWishlistClick}
        onBuyClick={onBuyClick}
      />

      <OptionBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={onBottomSheetClose}
        productName={product.name}
        mainOptions={product.mainOptions}
        subOptions={product.subOptions}
        onConfirm={onOptionConfirm}
      />
    </div>
  );
}
