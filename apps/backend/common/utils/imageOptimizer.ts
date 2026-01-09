import sharp from 'sharp';

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface OptimizeResult {
  buffer: Buffer;
  format: string;
  originalSize: number;
  optimizedSize: number;
}

const DEFAULT_OPTIONS: OptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 80,
};

const BANNER_OPTIONS: OptimizeOptions = {
  maxWidth: 1200,
  maxHeight: 600,
  quality: 85,
};

const THUMBNAIL_OPTIONS: OptimizeOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 80,
};

const PRODUCT_DETAIL_OPTIONS: OptimizeOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
};

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = DEFAULT_OPTIONS
): Promise<OptimizeResult> {
  const originalSize = buffer.length;
  
  const image = sharp(buffer, { animated: true });
  const metadata = await image.metadata();
  
  const targetFormat = options.format || getOptimalFormat(metadata.format);
  const isAnimated = (metadata.pages ?? 1) > 1;
  
  let pipeline = image;
  
  if (options.maxWidth || options.maxHeight) {
    pipeline = pipeline.resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  
  let outputBuffer: Buffer;
  
  switch (targetFormat) {
    case 'gif':
      outputBuffer = await pipeline.gif().toBuffer();
      break;
    case 'webp':
      outputBuffer = await pipeline.webp({ quality: options.quality || 80 }).toBuffer();
      break;
    case 'png':
      outputBuffer = await pipeline.png({ quality: options.quality || 80 }).toBuffer();
      break;
    case 'jpeg':
    default:
      outputBuffer = await pipeline.jpeg({ quality: options.quality || 80 }).toBuffer();
      break;
  }
  
  return {
    buffer: outputBuffer,
    format: targetFormat,
    originalSize,
    optimizedSize: outputBuffer.length,
  };
}

export async function optimizeBannerImage(buffer: Buffer): Promise<OptimizeResult> {
  return optimizeImage(buffer, BANNER_OPTIONS);
}

export async function optimizeThumbnailImage(buffer: Buffer): Promise<OptimizeResult> {
  return optimizeImage(buffer, THUMBNAIL_OPTIONS);
}

export async function optimizeProductDetailImage(buffer: Buffer): Promise<OptimizeResult> {
  return optimizeImage(buffer, PRODUCT_DETAIL_OPTIONS);
}

function getOptimalFormat(inputFormat: string | undefined): 'jpeg' | 'png' | 'webp' | 'gif' {
  switch (inputFormat) {
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'gif':
      return 'gif';
    default:
      return 'jpeg';
  }
}

export function isImageFile(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
}
