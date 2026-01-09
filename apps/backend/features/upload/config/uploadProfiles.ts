export type ImageOptimizationType = 'banner' | 'thumbnail' | 'product_detail' | 'none';

export interface UploadProfile {
  purpose: string;
  storagePath: string;
  requiresAuth: boolean;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
  acl: 'public' | 'private';
  imageOptimization?: ImageOptimizationType;
}

const COMMON_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const UPLOAD_PROFILES: Record<string, UploadProfile> = {
  review: {
    purpose: 'review',
    storagePath: 'uploads/reviews',
    requiresAuth: false,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes: COMMON_IMAGE_MIME_TYPES,
    acl: 'public',
    imageOptimization: 'thumbnail',
  },
  inquiry: {
    purpose: 'inquiry',
    storagePath: 'uploads/inquiries',
    requiresAuth: true,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes: COMMON_IMAGE_MIME_TYPES,
    acl: 'public',
    imageOptimization: 'thumbnail',
  },
  profile: {
    purpose: 'profile',
    storagePath: 'uploads/profiles',
    requiresAuth: true,
    maxFileSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: COMMON_IMAGE_MIME_TYPES,
    acl: 'public',
    imageOptimization: 'thumbnail',
  },
  support: {
    purpose: 'support',
    storagePath: 'uploads/support',
    requiresAuth: true,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes: [...COMMON_IMAGE_MIME_TYPES, 'application/pdf'],
    acl: 'private',
    imageOptimization: 'none',
  },
  banner: {
    purpose: 'banner',
    storagePath: 'uploads/banners',
    requiresAuth: false,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes: COMMON_IMAGE_MIME_TYPES,
    acl: 'public',
    imageOptimization: 'banner',
  },
  'product-thumbnail': {
    purpose: 'product-thumbnail',
    storagePath: 'uploads/products/thumbnails',
    requiresAuth: false,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes: COMMON_IMAGE_MIME_TYPES,
    acl: 'public',
    imageOptimization: 'thumbnail',
  },
  'product-detail': {
    purpose: 'product-detail',
    storagePath: 'uploads/products/details',
    requiresAuth: false,
    maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE,
    allowedMimeTypes: COMMON_IMAGE_MIME_TYPES,
    acl: 'public',
    imageOptimization: 'product_detail',
  },
};

export function getUploadProfile(purpose: string): UploadProfile | undefined {
  return UPLOAD_PROFILES[purpose];
}

export function isValidPurpose(purpose: string): boolean {
  return purpose in UPLOAD_PROFILES;
}
