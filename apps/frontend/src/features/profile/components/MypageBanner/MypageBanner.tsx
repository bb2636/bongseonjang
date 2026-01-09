import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMypageBanners, type MypageBanner as BannerType } from '../../api/mypageBannerApi';
import './MypageBanner.css';

export default function MypageBanner() {
  return null;
  
  const navigate = useNavigate();
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await fetchMypageBanners();
        setBanners(data);
      } catch (error) {
        console.error('Failed to load mypage banners:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBanners();
  }, []);

  if (isLoading || banners.length === 0) {
    return null;
  }

  const handleBannerClick = (banner: BannerType) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank');
      } else {
        navigate(banner.linkUrl);
      }
    }
  };

  return (
    <div className="mypage-banner">
      {banners.map((banner) => (
        <button
          key={banner.id}
          type="button"
          className="mypage-banner__item"
          onClick={() => handleBannerClick(banner)}
        >
          <img
            src={banner.imageUrl}
            alt="마이페이지 배너"
            className="mypage-banner__image"
          />
        </button>
      ))}
    </div>
  );
}
