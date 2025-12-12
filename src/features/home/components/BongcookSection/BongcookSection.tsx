import { ProductSection } from '@/components/ProductSection';
import type { BongcookProduct } from '../../types/bongcook';

interface BongcookSectionProps {
  products: BongcookProduct[];
  isLoading: boolean;
  onHeartClick?: (productId: string) => void;
  onViewAll?: () => void;
}

export default function BongcookSection({
  products,
  isLoading,
  onHeartClick,
  onViewAll,
}: BongcookSectionProps) {
  return (
    <ProductSection
      title="봉쿡 제품"
      products={products}
      isLoading={isLoading}
      onViewAll={onViewAll}
    />
  );
}
