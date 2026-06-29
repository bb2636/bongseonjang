import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../config/database.js';
import { ObjectStorageService } from '../objectStorage.js';
import { ProductImage, ImageType } from '../entity/ProductImage.js';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const DETAIL_STORAGE_PATH = 'uploads/products/details';
const MINIMUM_PARTIAL_MATCH_LENGTH = 2;

const isDryRun = process.argv.includes('--dry') || process.env.DRY_RUN === '1';
const allowAppend = process.argv.includes('--append');
const imagesDir = path.resolve(
  process.env.IMAGES_DIR || path.join(process.cwd(), 'detail-images'),
);

interface ProductRow {
  id: string;
  name: string;
}

interface ParsedFile {
  fileName: string;
  base: string;
  order: number | null;
}

interface ProductGroup {
  product: ProductRow;
  files: ParsedFile[];
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function parseFileName(fileName: string): ParsedFile {
  const noExtension = fileName.replace(/\.[^.]+$/, '');

  const suffixMatch =
    noExtension.match(/[_-]\s*(\d+)\s*$/) || noExtension.match(/\((\d+)\)\s*$/);

  if (suffixMatch && suffixMatch.index !== undefined) {
    return {
      fileName,
      base: normalize(noExtension.slice(0, suffixMatch.index)),
      order: Number.parseInt(suffixMatch[1], 10),
    };
  }

  return { fileName, base: normalize(noExtension), order: null };
}

type MatchResult =
  | { kind: 'matched'; product: ProductRow; how: 'exact' | 'partial' }
  | { kind: 'ambiguous'; candidates: ProductRow[] }
  | { kind: 'none' };

function matchProduct(base: string, products: ProductRow[]): MatchResult {
  const target = normalize(base).toLowerCase();

  const exact = products.filter(
    product => normalize(product.name).toLowerCase() === target,
  );
  if (exact.length === 1) return { kind: 'matched', product: exact[0], how: 'exact' };
  if (exact.length > 1) return { kind: 'ambiguous', candidates: exact };

  if (target.length >= MINIMUM_PARTIAL_MATCH_LENGTH) {
    const partial = products.filter(product => {
      const name = normalize(product.name).toLowerCase();
      return name.includes(target) || target.includes(name);
    });
    if (partial.length === 1) return { kind: 'matched', product: partial[0], how: 'partial' };
    if (partial.length > 1) return { kind: 'ambiguous', candidates: partial };
  }

  return { kind: 'none' };
}

function sortFiles(files: ParsedFile[]): ParsedFile[] {
  return [...files].sort((a, b) => {
    if (a.order !== null && b.order !== null) return a.order - b.order;
    if (a.order !== null) return -1;
    if (b.order !== null) return 1;
    return a.fileName.localeCompare(b.fileName);
  });
}

async function run(): Promise<void> {
  if (!fs.existsSync(imagesDir)) {
    console.error(`이미지 폴더가 없습니다: ${imagesDir}`);
    console.error("프로젝트 루트에 'detail-images' 폴더를 만들고 이미지를 넣어주세요.");
    process.exit(1);
  }

  const fileNames = fs
    .readdirSync(imagesDir)
    .filter(name => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()));

  if (fileNames.length === 0) {
    console.error(`'${imagesDir}' 폴더에 이미지 파일이 없습니다.`);
    process.exit(1);
  }

  await AppDataSource.initialize();

  try {
    const products: ProductRow[] = await AppDataSource.query(
      'SELECT id, name FROM products',
    );

    const groups = new Map<string, ProductGroup>();
    const ambiguous: Array<{ fileName: string; candidates: ProductRow[] }> = [];
    const unmatched: string[] = [];

    for (const fileName of fileNames) {
      const parsed = parseFileName(fileName);
      const result = matchProduct(parsed.base, products);

      if (result.kind === 'matched') {
        const existing = groups.get(result.product.id);
        if (existing) {
          existing.files.push(parsed);
        } else {
          groups.set(result.product.id, { product: result.product, files: [parsed] });
        }
      } else if (result.kind === 'ambiguous') {
        ambiguous.push({ fileName, candidates: result.candidates });
      } else {
        unmatched.push(fileName);
      }
    }

    console.log(`\n=== 매칭 결과 (${isDryRun ? 'DRY RUN - 저장 안 함' : '실제 등록'}) ===`);
    console.log(`이미지 파일: ${fileNames.length}개, 매칭된 상품: ${groups.size}개\n`);

    for (const group of groups.values()) {
      const sorted = sortFiles(group.files).map(file => file.fileName);
      console.log(`✓ [${group.product.name}] ← ${sorted.join(', ')}`);
    }

    if (ambiguous.length > 0) {
      console.log('\n⚠ 여러 상품과 겹쳐서 건너뜀 (파일명을 더 정확히 해주세요):');
      for (const item of ambiguous) {
        const names = item.candidates.map(candidate => candidate.name).join(' / ');
        console.log(`  - ${item.fileName} → 후보: ${names}`);
      }
    }

    if (unmatched.length > 0) {
      console.log('\n✗ 일치하는 상품이 없어서 건너뜀:');
      for (const fileName of unmatched) console.log(`  - ${fileName}`);
    }

    if (isDryRun) {
      console.log('\nDRY RUN 이므로 실제 등록은 하지 않았습니다. 결과가 맞으면 --dry 없이 다시 실행하세요.\n');
      return;
    }

    const imageRepository = AppDataSource.getRepository(ProductImage);
    const objectStorage = new ObjectStorageService();
    let insertedCount = 0;
    const skippedExisting: string[] = [];

    for (const group of groups.values()) {
      const existingCount = await imageRepository.count({
        where: { productId: group.product.id, imageType: ImageType.DETAIL },
      });

      if (existingCount > 0 && !allowAppend) {
        skippedExisting.push(group.product.name);
        console.log(
          `↪ 건너뜀(이미 상세 이미지 ${existingCount}개 있음): ${group.product.name} — 추가하려면 --append`,
        );
        continue;
      }

      const existingMax = await imageRepository
        .createQueryBuilder('image')
        .select('MAX(image.sortOrder)', 'max')
        .where('image.productId = :productId', { productId: group.product.id })
        .andWhere('image.imageType = :imageType', { imageType: ImageType.DETAIL })
        .getRawOne<{ max: number | null }>();

      const uploaded: Array<{ fileName: string; objectPath: string }> = [];
      for (const file of sortFiles(group.files)) {
        const buffer = fs.readFileSync(path.join(imagesDir, file.fileName));
        const objectPath = await objectStorage.uploadOptimizedImage(
          buffer,
          file.fileName,
          DETAIL_STORAGE_PATH,
          'product_detail',
        );
        uploaded.push({ fileName: file.fileName, objectPath });
      }

      try {
        await AppDataSource.transaction(async manager => {
          let sortOrder = (existingMax?.max ?? -1) + 1;
          for (const item of uploaded) {
            const image = manager.create(ProductImage, {
              productId: group.product.id,
              imageUrl: item.objectPath,
              imageType: ImageType.DETAIL,
              sortOrder,
            });
            await manager.save(image);
            sortOrder += 1;
          }
        });
        insertedCount += uploaded.length;
        console.log(`✓ ${group.product.name}: ${uploaded.length}개 등록`);
      } catch (error) {
        console.error(
          `✗ ${group.product.name} 등록 실패 (롤백됨). 업로드된 미사용 파일: ${uploaded
            .map(item => item.objectPath)
            .join(', ')}`,
        );
        throw error;
      }
    }

    console.log(`\n총 ${insertedCount}개 상세 이미지를 등록했습니다.`);
    if (skippedExisting.length > 0) {
      console.log(
        `이미 상세 이미지가 있어 건너뛴 상품 ${skippedExisting.length}개 (필요시 --append).`,
      );
    }
    console.log('');
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch(error => {
  console.error('스크립트 실행 중 오류:', error);
  process.exit(1);
});
