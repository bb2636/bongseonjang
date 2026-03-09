import type { EventDto } from '../domain/Event.js';
import { bannerRepository } from '../../banner/repository/bannerRepository.js';
import type { Banner } from '../../../entity/Banner.js';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

function transformBannerToEventDto(banner: Banner): EventDto {
  return {
    id: String(banner.id),
    title: banner.title ?? '',
    description: banner.description ?? undefined,
    imageUrl: toAbsoluteImageUrl(banner.imageUrl),
    linkUrl: banner.linkUrl ?? undefined,
    startDate: banner.startedAt?.toISOString() ?? undefined,
    endDate: banner.endedAt?.toISOString() ?? undefined,
  };
}

export class EventService {
  private isWithinDateRange(banner: Banner): boolean {
    const now = new Date();
    if (banner.startedAt && banner.startedAt > now) return false;
    if (banner.endedAt && banner.endedAt < now) return false;
    return true;
  }

  async getActiveEvents(): Promise<EventDto[]> {
    const banners = await bannerRepository.findBannersByPositionCode('HOME_EVENT');
    const activeBanners = banners.filter(banner => {
      if (!banner.isActive) return false;
      return this.isWithinDateRange(banner);
    });
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

    if (!this.isWithinDateRange(banner)) {
      return null;
    }
    
    return transformBannerToEventDto(banner);
  }
}
