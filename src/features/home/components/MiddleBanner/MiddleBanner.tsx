import { BannerCarousel } from '@/components/BannerCarousel';
import type { MiddleBannerImage } from '../../types/middleBanner';

interface MiddleBannerProps {
  banners: MiddleBannerImage[];
  isLoading: boolean;
}

const MIDDLE_BANNER_HEIGHT = 94;

export default function MiddleBanner({ banners, isLoading }: MiddleBannerProps) {
  return (
    <BannerCarousel
      images={banners}
      isLoading={isLoading}
      height={MIDDLE_BANNER_HEIGHT}
      loop
    />
  );
}
