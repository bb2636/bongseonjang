export interface FaqCategory {
  id: number;
  name: string;
  sortOrder: number;
}

export interface FaqItem {
  id: number;
  categoryId: number;
  title: string;
  content: string;
}
