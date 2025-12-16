export interface HeroImage {
  id: number;
  imageUrl: string;
  linkUrl?: string;
  order: number;
}

export interface HeroImageResponse {
  success: boolean;
  data: HeroImage[];
}
