import type { MdPickRepository, MdPickProduct } from './MdPickRepository';

const MOCK_MD_PICKS: MdPickProduct[] = [
  {
    id: 'bbbb2222-2222-2222-2222-222222222222',
    name: '제주 은갈치 대 3마리',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=280&fit=crop',
    discountPercent: 15,
    discountedPrice: 29750,
  },
  {
    id: 'bbbb3333-3333-3333-3333-333333333333',
    name: '완도 활전복 중 10미',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=280&fit=crop',
    discountPercent: 20,
    discountedPrice: 36000,
  },
  {
    id: 'bbbb4444-4444-4444-4444-444444444444',
    name: '통영 생굴 1kg',
    imageUrl: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=400&h=280&fit=crop',
    discountPercent: 18,
    discountedPrice: 20500,
  },
  {
    id: 'bbbb5555-5555-5555-5555-555555555555',
    name: '노르웨이 생연어 500g',
    imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=280&fit=crop',
    discountPercent: 25,
    discountedPrice: 24000,
  },
];

export class MockMdPickRepository implements MdPickRepository {
  async findAll(): Promise<MdPickProduct[]> {
    return MOCK_MD_PICKS;
  }
}
