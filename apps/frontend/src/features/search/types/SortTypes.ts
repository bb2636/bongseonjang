export type SortBy = 'default' | 'newest' | 'priceAsc' | 'priceDesc' | 'discountDesc';

export interface SortOption {
  value: SortBy;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: '기본순' },
  { value: 'newest', label: '신상품순' },
  { value: 'priceAsc', label: '가격 낮은순' },
  { value: 'priceDesc', label: '가격 높은순' },
  { value: 'discountDesc', label: '할인율순' },
];
