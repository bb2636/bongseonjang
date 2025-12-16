export interface FaqCategory {
  id: string;
  name: string;
}

export interface FaqItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
}
