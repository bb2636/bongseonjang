import type { LargeProduct } from '@/components/LargeProductCard';

export interface BestProduct extends LargeProduct {
  originalPrice: number;
  rank: number;
}
