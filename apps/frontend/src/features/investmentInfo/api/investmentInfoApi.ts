import { apiClient } from '../../../services';
import { InvestmentInfo, InvestmentInfoCategory, InvestmentInfoDetail } from '../types/investmentInfo';

interface InvestmentInfoListItemDto {
  id: number;
  title: string;
  typeCode: string;
  typeName: string;
  isVisible: boolean;
  createdAt: string;
}

interface InvestmentInfoListResponse {
  investmentInfos: InvestmentInfoListItemDto[];
  total: number;
}

interface InvestmentInfoDetailDto {
  id: number;
  title: string;
  content: string;
  typeId: number;
  typeCode: string;
  typeName: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_INVESTMENT_INFO_CATEGORY: InvestmentInfoCategory = '일반';

function resolveInvestmentInfoCategory(typeName: string): InvestmentInfoCategory {
  const validCategories: InvestmentInfoCategory[] = ['일반', '이벤트', '중요'];
  const matchedCategory = validCategories.find((category) => category === typeName);

  if (matchedCategory) {
    return matchedCategory;
  }

  return DEFAULT_INVESTMENT_INFO_CATEGORY;
}

function formatInvestmentInfoDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function mapInvestmentInfoListItems(investmentInfos: InvestmentInfoListItemDto[]): InvestmentInfo[] {
  return investmentInfos.map((info) => ({
    id: info.id.toString(),
    category: resolveInvestmentInfoCategory(info.typeName || info.typeCode),
    title: info.title,
    createdAt: formatInvestmentInfoDate(info.createdAt),
  }));
}

export async function fetchInvestmentInfos(): Promise<InvestmentInfo[]> {
  const response = await apiClient.get<InvestmentInfoListResponse>('/admin/investment-infos');

  return mapInvestmentInfoListItems(response.investmentInfos);
}

export async function fetchInvestmentInfoById(id: string): Promise<InvestmentInfoDetail> {
  const response = await apiClient.get<InvestmentInfoDetailDto>(`/admin/investment-infos/${id}`);

  return {
    id: response.id.toString(),
    category: resolveInvestmentInfoCategory(response.typeName || response.typeCode),
    title: response.title,
    content: response.content,
    createdAt: formatInvestmentInfoDate(response.createdAt),
  };
}
