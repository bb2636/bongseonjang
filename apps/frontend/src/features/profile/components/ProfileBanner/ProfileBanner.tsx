import { BannerCarousel } from '@/components/BannerCarousel';
import { useMypageBanners } from '../../hooks/useMypageBanners';
import './ProfileBanner.css';

const PROFILE_BANNER_HEIGHT = 120;
const AUTOPLAY_DELAY = 4000;

export default function ProfileBanner() {
  const { banners, isLoading } = useMypageBanners();

  if (!isLoading && banners.length === 0) {
    return null;
  }

  return (
    <div className="profile-banner">
      <BannerCarousel
        images={banners}
        isLoading={isLoading}
        height={PROFILE_BANNER_HEIGHT}
        autoplay
        autoplayDelay={AUTOPLAY_DELAY}
        pagination={false}
        loop
      />
    </div>
  );
}
