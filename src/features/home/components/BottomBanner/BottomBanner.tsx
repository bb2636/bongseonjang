import { BannerCarousel } from '@/components/BannerCarousel';
import type { BottomBannerImage } from '../../types/bottomBanner';

interface BottomBannerProps {
  banners: BottomBannerImage[];
  isLoading: boolean;
}

const BOTTOM_BANNER_HEIGHT = 94;

export default function BottomBanner({ banners, isLoading }: BottomBannerProps) {
  return (
    <BannerCarousel
      images={banners}
      isLoading={isLoading}
      height={BOTTOM_BANNER_HEIGHT}
      loop
    />
  );
}
