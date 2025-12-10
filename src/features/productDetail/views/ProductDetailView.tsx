import ProductImageSlider from '../components/ProductImageSlider';
import ProductInfo from '../components/ProductInfo';
import ProductOptions from '../components/ProductOptions';
import ProductDescription from '../components/ProductDescription';
import ReviewSection from '../components/ReviewSection';
import BottomActionBar from '../components/BottomActionBar';
import DetailAppBar from '../components/DetailAppBar';
import type { ProductDetail, ProductOption } from '../types/productDetail';
import './ProductDetailView.css';

interface ProductDetailViewProps {
  product: ProductDetail;
  selectedOption: ProductOption | null;
  quantity: number;
  isWishlisted: boolean;
  totalPrice: number;
  onOptionSelect: (option: ProductOption) => void;
  onQuantityChange: (quantity: number) => void;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onBuyClick: () => void;
  onShare: () => void;
}

export default function ProductDetailView({
  product,
  selectedOption,
  quantity,
  isWishlisted,
  totalPrice,
  onOptionSelect,
  onQuantityChange,
  onWishlistClick,
  onCartClick,
  onBuyClick,
  onShare,
}: ProductDetailViewProps) {
  return (
    <div className="product-detail-view">
      <DetailAppBar onCartClick={onCartClick} />
      
      <div className="product-detail-view__content">
        <ProductImageSlider
          images={product.images.filter(img => img.imageType === 'GALLERY')}
          thumbnailUrl={product.thumbnailUrl}
        />

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

        <ProductOptions
          options={product.options}
          selectedOption={selectedOption}
          quantity={quantity}
          onOptionSelect={onOptionSelect}
          onQuantityChange={onQuantityChange}
        />

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

        <ReviewSection
          reviewCount={product.reviewCount}
          averageRating={product.averageRating}
        />
      </div>

      <BottomActionBar
        totalPrice={totalPrice}
        isWishlisted={isWishlisted}
        onWishlistClick={onWishlistClick}
        onCartClick={onCartClick}
        onBuyClick={onBuyClick}
      />
    </div>
  );
}
