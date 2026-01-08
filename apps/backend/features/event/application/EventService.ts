import type { EventDto } from '../domain/Event.js';
import { bannerRepository } from '../../banner/repository/bannerRepository.js';
import type { Banner } from '../../../entity/Banner.js';

function transformBannerToEventDto(banner: Banner): EventDto {
  return {
    id: String(banner.id),
    title: banner.title ?? '',
    description: banner.description ?? undefined,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl ?? undefined,
    startDate: banner.startedAt?.toISOString() ?? undefined,
    endDate: banner.endedAt?.toISOString() ?? undefined,
  };
}

export class EventService {
  async getActiveEvents(): Promise<EventDto[]> {
    const banners = await bannerRepository.findBannersByPositionCode('HOME_EVENT');
    const activeBanners = banners.filter(banner => banner.isActive);
    return activeBanners.map(transformBannerToEventDto);
  }

  async getEventById(id: string): Promise<EventDto | null> {
    const bannerId = parseInt(id, 10);
    if (isNaN(bannerId)) {
      return null;
    }
    
    const banner = await bannerRepository.findBannerById(bannerId);
    if (!banner || !banner.isActive || banner.position?.code !== 'HOME_EVENT') {
      return null;
    }
    
    return transformBannerToEventDto(banner);
  }
}
