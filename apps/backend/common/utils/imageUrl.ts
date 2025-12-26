const getBaseUrl = (): string => {
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  const domains = process.env.REPLIT_DOMAINS;
  
  if (devDomain) {
    return `https://${devDomain}`;
  }
  
  if (domains) {
    const firstDomain = domains.split(',')[0].trim();
    return `https://${firstDomain}`;
  }
  
  return '';
};

export const toAbsoluteImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return '';
  }
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  if (path.startsWith('/objects/')) {
    const baseUrl = getBaseUrl();
    return baseUrl ? `${baseUrl}${path}` : path;
  }
  
  return path;
};

export const toAbsoluteImageUrls = <T extends { imageUrl?: string | null }>(
  items: T[]
): T[] => {
  return items.map(item => ({
    ...item,
    imageUrl: toAbsoluteImageUrl(item.imageUrl),
  }));
};
