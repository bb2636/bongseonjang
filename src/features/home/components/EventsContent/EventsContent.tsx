import { useEvents } from '../../hooks/useEvents';
import { EventCard } from '../EventCard';
import './EventsContent.css';

export default function EventsContent() {
  const { events, isLoading, error } = useEvents();

  const handleEventClick = (eventId: string) => {
    console.log('Event clicked:', eventId);
  };

  if (isLoading) {
    return (
      <div className="events-content">
        <div className="events-content__loading">
          <div className="events-content__skeleton" />
          <div className="events-content__skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-content">
        <div className="events-content__error">
          <p>이벤트를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="events-content">
        <div className="events-content__empty">
          <p className="events-content__empty-title">진행 중인 이벤트가 없습니다</p>
          <p className="events-content__empty-description">새로운 이벤트를 기대해주세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-content">
      <div className="events-content__list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => handleEventClick(event.id)}
          />
        ))}
      </div>
    </div>
  );
}
