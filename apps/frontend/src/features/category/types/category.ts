export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const STATIC_CATEGORIES: Category[] = [
  { id: 'all', name: '전체', slug: 'all' },
  { id: 'new', name: '신상품', slug: 'new' },
  { id: 'best', name: '베스트', slug: 'best' },
];
