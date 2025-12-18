export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: '전체', slug: 'all' },
  { id: 'new', name: '신상품', slug: 'new' },
  { id: 'best', name: '베스트', slug: 'best' },
  { id: 'seasonal', name: '제철 수산물', slug: 'seasonal' },
  { id: 'frozen', name: '급랭 수산물', slug: 'frozen' },
  { id: 'prepared', name: '손질 수산물', slug: 'prepared' },
  { id: 'pickled', name: '바담은 절임류', slug: 'pickled' },
];
