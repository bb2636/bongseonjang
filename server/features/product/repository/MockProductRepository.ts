import type { ProductDto } from '../domain/Product';
import type { ProductRepository } from './ProductRepository';

const MOCK_PRODUCTS: ProductDto[] = [
  {
    id: '1',
    name: '알배기 암꽃게 간장게장',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=280&fit=crop',
    originalPrice: 28000,
    discountPercent: 22,
    discountedPrice: 21900,
  },
  {
    id: '2',
    name: '제주 은갈치 대 3마리',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=280&fit=crop',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
  },
];

export class MockProductRepository implements ProductRepository {
  async findByDisplayCategory(_categoryName: string): Promise<ProductDto[]> {
    return MOCK_PRODUCTS;
  }

  async findAll(): Promise<ProductDto[]> {
    return MOCK_PRODUCTS;
  }
}
