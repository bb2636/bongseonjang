export interface FaqListItem {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqListResponse {
  faqs: FaqListItem[];
  total: number;
}

export interface FaqDetailResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  content: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqCategoryItem {
  id: number;
  name: string;
  sortOrder: number;
}

export interface CreateFaqDto {
  categoryId: number;
  title: string;
  content: string;
  isVisible?: boolean;
}

export interface UpdateFaqDto {
  categoryId?: number;
  title?: string;
  content?: string;
  isVisible?: boolean;
}
