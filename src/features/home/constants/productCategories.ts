export interface ProductCategory {
  id: string;
  label: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'all', label: '전체' },
  { id: 'seasonal', label: '제철 수산물' },
  { id: 'frozen', label: '급랭 수산물' },
  { id: 'prepared', label: '손질 수산물' },
  { id: 'pickled', label: '바담은 절임류' },
];
