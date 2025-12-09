import { ProductSection } from '@/components/ProductSection';
import type { BadameunProduct } from '../../types/badameun';

interface BadameunSectionProps {
  products: BadameunProduct[];
  isLoading: boolean;
  onAddToCart?: (productId: string) => void;
  onHeartClick?: (productId: string) => void;
  onViewAll?: () => void;
}

export default function BadameunSection({
  products,
  isLoading,
  onAddToCart,
  onHeartClick,
  onViewAll,
}: BadameunSectionProps) {
  return (
    <ProductSection
      title="바담은"
      products={products}
      isLoading={isLoading}
      showHeartButton
      onAddToCart={onAddToCart}
      onHeartClick={onHeartClick}
      onViewAll={onViewAll}
    />
  );
}
