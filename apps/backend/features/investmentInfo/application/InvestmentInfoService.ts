import type { InvestmentInfoRepository } from '../repository/InvestmentInfoRepository';
import type { InvestmentInfoListResponse, InvestmentInfoListItem, CreateInvestmentInfoDto, UpdateInvestmentInfoDto, InvestmentInfoDetailResponse } from '../domain/InvestmentInfo';

export class InvestmentInfoService {
  constructor(private readonly investmentInfoRepository: InvestmentInfoRepository) {}

  async getInvestmentInfosForAdmin(keyword?: string): Promise<InvestmentInfoListResponse> {
    const [investmentInfos, totalAll] = await Promise.all([
      this.investmentInfoRepository.findAllForAdmin(keyword),
      this.investmentInfoRepository.countAll(),
    ]);

    const investmentInfoItems: InvestmentInfoListItem[] = investmentInfos.map((info) => ({
      id: info.id,
      title: info.title,
      typeCode: info.investmentInfoType?.code ?? '',
      typeName: info.investmentInfoType?.name ?? '',
      isVisible: info.isVisible,
      createdAt: info.createdAt.toISOString(),
    }));

    return {
      investmentInfos: investmentInfoItems,
      total: keyword ? investmentInfos.length : totalAll,
    };
  }

  async getInvestmentInfos(keyword?: string): Promise<InvestmentInfoListResponse> {
    const [investmentInfos, totalVisible] = await Promise.all([
      this.investmentInfoRepository.findAll(keyword),
      this.investmentInfoRepository.countVisible(),
    ]);

    const investmentInfoItems: InvestmentInfoListItem[] = investmentInfos.map((info) => ({
      id: info.id,
      title: info.title,
      typeCode: info.investmentInfoType?.code ?? '',
      typeName: info.investmentInfoType?.name ?? '',
      isVisible: info.isVisible,
      createdAt: info.createdAt.toISOString(),
    }));

    return {
      investmentInfos: investmentInfoItems,
      total: keyword ? investmentInfos.length : totalVisible,
    };
  }

  async getInvestmentInfoByIdForAdmin(id: number): Promise<InvestmentInfoDetailResponse | null> {
    const info = await this.investmentInfoRepository.findByIdForAdmin(id);
    if (!info) {
      return null;
    }

    return {
      id: info.id,
      title: info.title,
      content: info.content,
      typeId: info.typeId,
      typeCode: info.investmentInfoType?.code ?? '',
      typeName: info.investmentInfoType?.name ?? '',
      isVisible: info.isVisible,
      createdAt: info.createdAt.toISOString(),
      updatedAt: info.updatedAt.toISOString(),
    };
  }

  async getInvestmentInfoById(id: number): Promise<InvestmentInfoDetailResponse | null> {
    const info = await this.investmentInfoRepository.findById(id);
    if (!info) {
      return null;
    }

    return {
      id: info.id,
      title: info.title,
      content: info.content,
      typeId: info.typeId,
      typeCode: info.investmentInfoType?.code ?? '',
      typeName: info.investmentInfoType?.name ?? '',
      isVisible: info.isVisible,
      createdAt: info.createdAt.toISOString(),
      updatedAt: info.updatedAt.toISOString(),
    };
  }

  async createInvestmentInfo(dto: CreateInvestmentInfoDto) {
    const info = await this.investmentInfoRepository.create({
      title: dto.title,
      content: dto.content,
      typeId: dto.typeId,
      isVisible: dto.isVisible,
    });

    return {
      id: info.id,
      title: info.title,
      content: info.content,
      typeId: info.typeId,
      isVisible: info.isVisible,
      createdAt: info.createdAt.toISOString(),
    };
  }

  async updateInvestmentInfo(id: number, dto: UpdateInvestmentInfoDto) {
    const info = await this.investmentInfoRepository.update(id, {
      title: dto.title,
      content: dto.content,
      typeId: dto.typeId,
      isVisible: dto.isVisible,
    });

    if (!info) {
      return null;
    }

    return {
      id: info.id,
      title: info.title,
      content: info.content,
      typeId: info.typeId,
      isVisible: info.isVisible,
      updatedAt: info.updatedAt.toISOString(),
    };
  }

  async deleteInvestmentInfo(id: number): Promise<boolean> {
    return this.investmentInfoRepository.delete(id);
  }
}
