import type { EventDto } from '../domain/Event';
import type { EventRepository } from './EventRepository';

const MOCK_EVENTS: EventDto[] = [
  {
    id: '1',
    title: '겨울 제철 굴, 전복 특가',
    description: '신선한 겨울 해산물을 특별한 가격에 만나보세요',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    title: '봉선장 신규 회원 할인 이벤트',
    description: '첫 구매 고객 15% 할인',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&h=400&fit=crop',
  },
];

export class MockEventRepository implements EventRepository {
  async findAllActive(): Promise<EventDto[]> {
    return MOCK_EVENTS;
  }
}
