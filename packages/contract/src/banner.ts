export type BannerPositionType = 'hero' | 'middle' | 'bottom' | 'popup';

export interface BannerDto {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  linkType: 'internal' | 'external' | null;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface BannerPositionDto {
  id: number;
  position: BannerPositionType;
  name: string;
  banners: BannerDto[];
}

export interface BannerListRequest {
  position?: BannerPositionType;
  isActive?: boolean;
}

export interface BannerListResponse {
  positions: BannerPositionDto[];
}

export interface HeroBannerDto {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  linkType: 'internal' | 'external' | null;
  sortOrder: number;
}

export interface MiddleBannerDto {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}

export interface BottomBannerDto {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}
