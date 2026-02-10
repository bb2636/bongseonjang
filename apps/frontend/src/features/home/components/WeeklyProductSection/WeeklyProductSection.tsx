import { ProductSection } from '@/components/ProductSection';
import type { WeeklyProduct } from '../../types/weeklyProduct';

interface WeeklyProductSectionProps {
  products: WeeklyProduct[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export default function WeeklyProductSection({
  products,
  isLoading,
  onViewAll,
}: WeeklyProductSectionProps) {
  return (
    <ProductSection
      title="이 주의 상품"
      products={products}
      isLoading={isLoading}
      onViewAll={onViewAll}
    />
  );
}
