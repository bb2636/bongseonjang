export interface ProductCategory {
  id: string;
  label: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'all', label: '전체' },
  { id: '해산물', label: '해산물' },
  { id: '건어물', label: '건어물' },
  { id: '젓갈/장류', label: '젓갈/장류' },
  { id: '김/해초', label: '김/해초' },
  { id: '수산가공', label: '수산가공' },
];
