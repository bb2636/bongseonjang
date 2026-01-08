import { BannerCarousel } from '@/components/BannerCarousel';
import { useMypageBanners } from '../../hooks/useMypageBanners';
import './ProfileBanner.css';

const PROFILE_BANNER_HEIGHT = 120;
const GUEST_BANNER_HEIGHT = 140;
const AUTOPLAY_DELAY = 4000;

interface ProfileBannerProps {
  isGuest?: boolean;
}

export default function ProfileBanner({ isGuest = false }: ProfileBannerProps) {
  const { banners, isLoading } = useMypageBanners();

  if (!isLoading && banners.length === 0) {
    return null;
  }

  const height = isGuest ? GUEST_BANNER_HEIGHT : PROFILE_BANNER_HEIGHT;
  const className = `profile-banner${isGuest ? ' profile-banner--guest' : ''}`;

  return (
    <div className={className}>
      <BannerCarousel
        images={banners}
        isLoading={isLoading}
        height={height}
        autoplay
        autoplayDelay={AUTOPLAY_DELAY}
        pagination={false}
        loop
      />
    </div>
  );
}
