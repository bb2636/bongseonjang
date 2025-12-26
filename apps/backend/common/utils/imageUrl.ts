const getBaseUrl = (): string => {
  // 배포 환경 우선 확인 (production)
  const deploymentUrl = process.env.REPLIT_DEPLOYMENT_URL;
  if (deploymentUrl) {
    return deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`;
  }
  
  // 배포된 도메인 확인
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const firstDomain = domains.split(',')[0].trim();
    // .replit.app 도메인이 있으면 배포 환경
    if (firstDomain.includes('.replit.app')) {
      return `https://${firstDomain}`;
    }
  }
  
  // 개발 환경 (development)
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) {
    return `https://${devDomain}`;
  }
  
  // 마지막 폴백
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
