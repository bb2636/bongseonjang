export interface InvestmentInfoTypeInfo {
  id: number;
  code: string;
  name: string;
}

export interface InvestmentInfo {
  id: number;
  typeId: number;
  title: string;
  content: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  investmentInfoType?: InvestmentInfoTypeInfo;
}

export interface InvestmentInfoListItem {
  id: number;
  title: string;
  typeCode: string;
  typeName: string;
  isVisible: boolean;
  createdAt: string;
}

export interface InvestmentInfoListResponse {
  investmentInfos: InvestmentInfoListItem[];
  total: number;
}

export interface CreateInvestmentInfoDto {
  title: string;
  content: string;
  typeId: number;
  isVisible?: boolean;
}

export interface UpdateInvestmentInfoDto {
  title?: string;
  content?: string;
  typeId?: number;
  isVisible?: boolean;
}

export interface InvestmentInfoDetailResponse {
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
