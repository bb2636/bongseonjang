export type InvestmentInfoCategory = '일반' | '이벤트' | '중요';

export interface InvestmentInfo {
  id: string;
  category: InvestmentInfoCategory;
  title: string;
  createdAt: string;
}

export interface InvestmentInfoDetail {
  id: string;
  category: InvestmentInfoCategory;
  title: string;
  content: string;
  createdAt: string;
}
