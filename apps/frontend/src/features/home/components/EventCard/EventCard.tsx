import { useState } from 'react';
import type { EventData } from '../../api/eventApi';
import './EventCard.css';

interface EventCardProps {
  event: EventData;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const hasValidImage = event.imageUrl && !imageError;

  return (
    <div className="event-card" onClick={onClick}>
      {hasValidImage ? (
        <div className="event-card__image-container">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="event-card__image"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="event-card__placeholder">
          <h3 className="event-card__title">{event.title}</h3>
          {event.description && (
            <p className="event-card__description">{event.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
