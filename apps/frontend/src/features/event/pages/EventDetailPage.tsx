import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppBar } from '@/components/AppBar';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import { useGoBack } from '../../../hooks/useGoBack';
import './EventDetailPage.css';

interface EventDetail {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!response.ok) {
          throw new Error('이벤트를 찾을 수 없습니다');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '이벤트를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const handleBack = () => {
    goBack();
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="event-detail-page">
        <AppBar
          variant="subpage"
          title="이벤트"
          showBackButton
          onBackClick={handleBack}
          showCart
          onCartClick={handleCartClick}
        />
        <div className="event-detail-page__loading">
          <div className="event-detail-page__spinner" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <AppBar
          variant="subpage"
          title="이벤트"
          showBackButton
          onBackClick={handleBack}
          showCart
          onCartClick={handleCartClick}
        />
        <div className="event-detail-page__error">
          <p>{error || '이벤트를 찾을 수 없습니다'}</p>
          <button onClick={handleBack} className="event-detail-page__back-btn">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <AppBar
        variant="subpage"
        title={event.title}
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />
      <main className="event-detail-page__content">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="event-detail-page__image"
        />
        {event.description && (
          <div className="event-detail-page__description">
            <p>{event.description}</p>
          </div>
        )}
        {event.startDate && event.endDate && (
          <div className="event-detail-page__period">
            <span className="event-detail-page__period-label">이벤트 기간</span>
            <span className="event-detail-page__period-value">
              {new Date(event.startDate).toLocaleDateString('ko-KR')} ~ {new Date(event.endDate).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
