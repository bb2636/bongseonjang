import sharp from 'sharp';
import { readdir, unlink } from 'fs/promises';
import { join, basename, extname } from 'path';

const CATEGORY_DIR = 'src/assets/image/category';

const LARGE_SVGS = [
  'obada.svg',
  'bongcook.svg', 
  'badameun.svg',
  'fourseason.svg'
];

async function convertSvgToWebp(svgPath, outputPath) {
  try {
    await sharp(svgPath, { density: 300 })
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`Converted: ${svgPath} -> ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error converting ${svgPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting SVG to WebP conversion...\n');
  
  for (const svgFile of LARGE_SVGS) {
    const svgPath = join(CATEGORY_DIR, svgFile);
    const webpFile = svgFile.replace('.svg', '.webp');
    const webpPath = join(CATEGORY_DIR, webpFile);
    
    const success = await convertSvgToWebp(svgPath, webpPath);
    if (success) {
      console.log(`  Size reduction achieved for ${svgFile}`);
    }
  }
  
  console.log('\nConversion complete!');
}

main().catch(console.error);
