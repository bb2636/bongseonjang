export type SortBy = 'default' | 'bestSelling' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'reviewDesc' | 'newest';

export interface SortOption {
  value: SortBy;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: '정렬' },
  { value: 'bestSelling', label: '판매 많은순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
  { value: 'ratingDesc', label: '평점 높은순' },
  { value: 'reviewDesc', label: '후기 많은순' },
  { value: 'newest', label: '최근 등록순' },
];
