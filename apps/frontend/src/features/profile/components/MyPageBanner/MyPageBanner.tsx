import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../../shared/config/apiConfig';
import './MyPageBanner.css';

interface BannerData {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
}

export default function MyPageBanner() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await fetch(`${API_BASE_URL}/banners/position/MYPAGE`);
        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        }
      } catch (error) {
        console.error('Failed to fetch mypage banners:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerClick = (banner: BannerData) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank');
      } else {
        navigate(banner.linkUrl);
      }
    }
  };

  if (isLoading || banners.length === 0) {
    return null;
  }

  return (
    <div className="mypage-banner">
      <div 
        className="mypage-banner__slides"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="mypage-banner__slide"
            onClick={() => handleBannerClick(banner)}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title || '배너'}
              className="mypage-banner__image"
            />
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="mypage-banner__dots">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`mypage-banner__dot ${index === currentIndex ? 'mypage-banner__dot--active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`배너 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
