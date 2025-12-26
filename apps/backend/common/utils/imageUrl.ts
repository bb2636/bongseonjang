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
    // Check if it's an old replit.dev URL with /objects/ path
    // These need to be rebased to the current domain
    const replitDevMatch = path.match(/^https?:\/\/[^\/]*\.replit\.dev(\/objects\/.*)$/);
    if (replitDevMatch) {
      const relativePath = replitDevMatch[1];
      const baseUrl = getBaseUrl();
      return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
    }
    // External URLs (Unsplash, etc.) - return as-is
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
