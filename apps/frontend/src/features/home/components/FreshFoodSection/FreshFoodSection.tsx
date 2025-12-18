import { ProductSection } from '@/components/ProductSection';
import type { FreshFood } from '../../types/freshFood';

interface FreshFoodSectionProps {
  products: FreshFood[];
  isLoading: boolean;
  onHeartClick?: (productId: string) => void;
  onViewAll?: () => void;
}

export default function FreshFoodSection({
  products,
  isLoading,
  onHeartClick,
  onViewAll,
}: FreshFoodSectionProps) {
  return (
    <ProductSection
      title="신선식품"
      products={products}
      isLoading={isLoading}
      onViewAll={onViewAll}
    />
  );
}
