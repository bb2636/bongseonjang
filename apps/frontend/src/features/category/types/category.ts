export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const STATIC_CATEGORIES: Category[] = [
  { id: 'all', name: '전체', slug: 'all' },
];
