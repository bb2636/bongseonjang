import type { MdPickRepository, MdPickProduct } from './MdPickRepository';

const MOCK_MD_PICKS: MdPickProduct[] = [
  {
    id: 'mdpick-1',
    name: '알배기 암꽃게 간장게장',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=280&fit=crop',
    discountPercent: 22,
    discountedPrice: 21900,
  },
  {
    id: 'mdpick-2',
    name: '제주 갈치조림 밀키트',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=280&fit=crop',
    discountPercent: 15,
    discountedPrice: 18500,
  },
  {
    id: 'mdpick-3',
    name: '통영 굴전 세트',
    imageUrl: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=400&h=280&fit=crop',
    discountPercent: 20,
    discountedPrice: 24900,
  },
  {
    id: 'mdpick-4',
    name: '완도 전복죽 선물세트',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=280&fit=crop',
    discountPercent: 18,
    discountedPrice: 32000,
  },
];

export class MockMdPickRepository implements MdPickRepository {
  async findAll(): Promise<MdPickProduct[]> {
    return MOCK_MD_PICKS;
  }
}
