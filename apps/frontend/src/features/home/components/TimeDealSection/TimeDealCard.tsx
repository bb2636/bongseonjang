import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TimeDeal } from '../../types/timeDeal';
import { useQuickCart } from '@/contexts/QuickCartContext';
import './TimeDealCard.css';

interface TimeDealCardProps {
  deal: TimeDeal;
}

function calculateRemainingSeconds(endTime: string): number {
  const endTimeMs = new Date(endTime).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((endTimeMs - now) / 1000));
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function TimeDealCard({ deal }: TimeDealCardProps) {
  const navigate = useNavigate();
  const { openQuickCart } = useQuickCart();
  const [remainingSeconds, setRemainingSeconds] = useState(() => 
    calculateRemainingSeconds(deal.saleEndAt)
  );

  const handleCardClick = () => {
    navigate(`/product/${deal.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickCart(deal.id);
  };

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(calculateRemainingSeconds(deal.saleEndAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [deal.saleEndAt, remainingSeconds]);

  return (
    <div className="time-deal-card" onClick={handleCardClick}>
      <div className="time-deal-card__image-container">
        <div className="time-deal-card__image">
          {deal.imageUrl && (
            <img src={deal.imageUrl} alt={deal.name} loading="lazy" />
          )}
        </div>
        <div className="time-deal-card__timer">
          {formatTime(remainingSeconds)} 남음
        </div>
      </div>

      <div className="time-deal-card__info">
        <div className="time-deal-card__details">
          <span className="time-deal-card__name">{deal.name}</span>
          <div className="time-deal-card__price-row">
            <span className="time-deal-card__discount">{deal.discountPercent}%</span>
            <span className="time-deal-card__price">{formatPrice(deal.discountedPrice)}원</span>
          </div>
        </div>

        <button
          type="button"
          className="time-deal-card__add-button"
          onClick={handleAddToCart}
        >
          <svg
            className="time-deal-card__cart-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z"
              fill="currentColor"
            />
          </svg>
          <span>담기</span>
        </button>
      </div>
    </div>
  );
}
