import { useState } from 'react';
import type { EventData } from '../../api/eventApi';
import './EventCard.css';

const FALLBACK_IMAGE = 'https://placehold.co/800x400/f5f5f5/999999?text=No+Image';

interface EventCardProps {
  event: EventData;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-card__image-container">
        <img
          src={imageError ? FALLBACK_IMAGE : event.imageUrl}
          alt={event.title}
          className="event-card__image"
          onError={handleImageError}
        />
      </div>
      <div className="event-card__content">
        <h3 className="event-card__title">{event.title}</h3>
        {event.description && (
          <p className="event-card__description">{event.description}</p>
        )}
      </div>
    </div>
  );
}
