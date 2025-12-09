import { BannerCarousel } from '@/components/BannerCarousel';
import type { HeroImage } from '../../types/heroImage';

interface HeroBannerProps {
  heroImages: HeroImage[];
  isLoading: boolean;
}

const HERO_BANNER_HEIGHT = 247;
const AUTOPLAY_DELAY = 3000;

export default function HeroBanner({ heroImages, isLoading }: HeroBannerProps) {
  return (
    <BannerCarousel
      images={heroImages}
      isLoading={isLoading}
      height={HERO_BANNER_HEIGHT}
      autoplay
      autoplayDelay={AUTOPLAY_DELAY}
      pagination
      loop
    />
  );
}
