import { TimeDealCard } from './TimeDealCard';
import './TimeDealSection.css';

export interface TimeDealProduct {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  remainingSeconds: number;
}

interface TimeDealSectionProps {
  products?: TimeDealProduct[];
  onAddToCart?: (productId: string) => void;
}

const MOCK_PRODUCTS: TimeDealProduct[] = [
  {
    id: '1',
    name: '알배기 암꽃게 간장게장',
    originalPrice: 28000,
    discountPercent: 22,
    discountedPrice: 21900,
    remainingSeconds: 3600,
  },
  {
    id: '2',
    name: '제주 은갈치 대 3마리',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    remainingSeconds: 7200,
  },
  {
    id: '3',
    name: '완도 활전복 중 10미',
    originalPrice: 45000,
    discountPercent: 20,
    discountedPrice: 36000,
    remainingSeconds: 5400,
  },
  {
    id: '4',
    name: '통영 생굴 1kg',
    originalPrice: 25000,
    discountPercent: 18,
    discountedPrice: 20500,
    remainingSeconds: 1800,
  },
  {
    id: '5',
    name: '노르웨이 생연어 500g',
    originalPrice: 32000,
    discountPercent: 25,
    discountedPrice: 24000,
    remainingSeconds: 4200,
  },
];

export default function TimeDealSection({ 
  products = MOCK_PRODUCTS, 
  onAddToCart 
}: TimeDealSectionProps) {
  return (
    <section className="time-deal-section">
      <h2 className="time-deal-section__title">타임특가</h2>
      <div className="time-deal-section__list">
        {products.map((product) => (
          <TimeDealCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart?.(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
