import { AppDataSource } from '../config/database.js';

interface SeedData {
  shippingPolicies: Array<{ id: number; shipping_fee: number; description: string; is_active: boolean }>;
  productCategories: Array<{ id: string; name: string; sortOrder: number; isActive: boolean }>;
  exposureCategories: Array<{ id: number; name: string; sort_order: number }>;
  bannerPositions: Array<{ id: number; code: string; name: string; sort_no: number; is_active: boolean }>;
  noticeTypes: Array<{ id: number; code: string; name: string; sortNo: number; isActive: boolean }>;
  investmentInfoTypes: Array<{ id: number; code: string; name: string; sortNo: number; isActive: boolean }>;
  products: Array<{
    id: string;
    name: string;
    base_price: number;
    product_category_id: string;
    shipping_policy_id: number;
    stock_quantity: number;
  }>;
  productImages: Array<{
    id: string;
    productId: string;
    imageUrl: string;
    imageType: string;
    isThumbnail: boolean;
  }>;
  productOptions: Array<{
    id: number;
    product_id: string;
    option_name: string;
    option_value: string;
    price: number;
    sort_order: number;
  }>;
  productExposureCategories: Array<{ product_id: string; exposure_category_id: number }>;
  banners: Array<{
    id: number;
    title: string;
    image_url: string;
    link_url: string;
    banner_position_id: number;
    is_active: boolean;
    sort_no: number;
  }>;
}

const seedData: SeedData = {
  shippingPolicies: [
    { id: 1, shipping_fee: 0, description: '무료 배송', is_active: true },
    { id: 2, shipping_fee: 3000, description: '기본 배송비', is_active: true },
    { id: 3, shipping_fee: 5000, description: '도서산간 배송비', is_active: true },
  ],
  productCategories: [
    { id: '11111111-1111-1111-1111-111111111111', name: '제철수산', sortOrder: 1, isActive: true },
    { id: '22222222-2222-2222-2222-222222222222', name: '당일수산', sortOrder: 2, isActive: true },
    { id: '33333333-3333-3333-3333-333333333333', name: '손질수산', sortOrder: 3, isActive: true },
    { id: '44444444-4444-4444-4444-444444444444', name: '반건조/건조', sortOrder: 4, isActive: true },
    { id: '55555555-5555-5555-5555-555555555555', name: '젓갈/액젓', sortOrder: 5, isActive: true },
    { id: '66666666-6666-6666-6666-666666666666', name: '바담은', sortOrder: 6, isActive: true },
    { id: '77777777-7777-7777-7777-777777777777', name: '오바다', sortOrder: 7, isActive: true },
    { id: '88888888-8888-8888-8888-888888888888', name: '포시즌', sortOrder: 8, isActive: true },
    { id: '99999999-9999-9999-9999-999999999999', name: '봉쿡', sortOrder: 9, isActive: true },
  ],
  exposureCategories: [
    { id: 1, name: '베스트', sort_order: 1 },
    { id: 2, name: '신상품', sort_order: 2 },
    { id: 3, name: '바담은 제품', sort_order: 3 },
    { id: 4, name: 'MD추천!', sort_order: 4 },
    { id: 5, name: '이주의 상품', sort_order: 5 },
    { id: 6, name: '봉쿡 제품', sort_order: 6 },
    { id: 7, name: '봉선장 TV', sort_order: 7 },
    { id: 8, name: "봉선장's Brand", sort_order: 8 },
    { id: 9, name: '전체상품', sort_order: 0 },
  ],
  bannerPositions: [
    { id: 1, code: 'HOME_HERO', name: '홈/히어로', sort_no: 1, is_active: true },
    { id: 2, code: 'HOME_MIDDLE', name: '홈/중간', sort_no: 2, is_active: true },
    { id: 3, code: 'HOME_BOTTOM', name: '홈/하단', sort_no: 3, is_active: true },
    { id: 4, code: 'HOME_EVENT', name: '홈/이벤트', sort_no: 4, is_active: true },
    { id: 5, code: 'MYPAGE', name: '마이페이지', sort_no: 5, is_active: true },
  ],
  noticeTypes: [
    { id: 1, code: 'NOTICE', name: '공지', sortNo: 1, isActive: true },
    { id: 2, code: 'EVENT', name: '이벤트', sortNo: 2, isActive: true },
    { id: 3, code: 'SHIPPING', name: '배송', sortNo: 3, isActive: true },
    { id: 4, code: 'IMPORTANT', name: '중요', sortNo: 0, isActive: true },
  ],
  investmentInfoTypes: [
    { id: 1, code: 'NORMAL', name: '일반', sortNo: 1, isActive: true },
    { id: 2, code: 'IMPORTANT', name: '중요', sortNo: 2, isActive: true },
    { id: 3, code: 'EVENT', name: '이벤트', sortNo: 3, isActive: true },
  ],
  products: [
    { id: 'a1111111-1111-1111-1111-111111111111', name: '활 전복 (대) 10미', base_price: 45000, product_category_id: '11111111-1111-1111-1111-111111111111', shipping_policy_id: 2, stock_quantity: 100 },
    { id: 'a2222222-2222-2222-2222-222222222222', name: '제철 꽃게 1kg', base_price: 35000, product_category_id: '11111111-1111-1111-1111-111111111111', shipping_policy_id: 2, stock_quantity: 50 },
    { id: 'a3333333-3333-3333-3333-333333333333', name: '생 문어 (중) 1마리', base_price: 28000, product_category_id: '11111111-1111-1111-1111-111111111111', shipping_policy_id: 2, stock_quantity: 80 },
    { id: 'b1111111-1111-1111-1111-111111111111', name: '급랭 고등어 (손질) 5마리', base_price: 18000, product_category_id: '22222222-2222-2222-2222-222222222222', shipping_policy_id: 2, stock_quantity: 200 },
    { id: 'b2222222-2222-2222-2222-222222222222', name: '급랭 갈치 (특대) 3마리', base_price: 32000, product_category_id: '22222222-2222-2222-2222-222222222222', shipping_policy_id: 2, stock_quantity: 120 },
    { id: 'b3333333-3333-3333-3333-333333333333', name: '급랭 연어 필렛 500g', base_price: 25000, product_category_id: '22222222-2222-2222-2222-222222222222', shipping_policy_id: 2, stock_quantity: 150 },
    { id: 'c1111111-1111-1111-1111-111111111111', name: '손질 광어 (회용) 1마리', base_price: 38000, product_category_id: '33333333-3333-3333-3333-333333333333', shipping_policy_id: 2, stock_quantity: 60 },
    { id: 'c2222222-2222-2222-2222-222222222222', name: '손질 우럭 (매운탕용) 2마리', base_price: 22000, product_category_id: '33333333-3333-3333-3333-333333333333', shipping_policy_id: 2, stock_quantity: 90 },
    { id: 'c3333333-3333-3333-3333-333333333333', name: '손질 오징어 (볶음용) 500g', base_price: 15000, product_category_id: '33333333-3333-3333-3333-333333333333', shipping_policy_id: 2, stock_quantity: 180 },
    { id: 'd1111111-1111-1111-1111-111111111111', name: '바담은 명란젓 500g', base_price: 28000, product_category_id: '55555555-5555-5555-5555-555555555555', shipping_policy_id: 1, stock_quantity: 100 },
    { id: 'd2222222-2222-2222-2222-222222222222', name: '바담은 오징어젓 300g', base_price: 18000, product_category_id: '55555555-5555-5555-5555-555555555555', shipping_policy_id: 1, stock_quantity: 120 },
    { id: 'd3333333-3333-3333-3333-333333333333', name: '바담은 낙지젓 300g', base_price: 22000, product_category_id: '55555555-5555-5555-5555-555555555555', shipping_policy_id: 1, stock_quantity: 80 },
  ],
  productImages: [
    { id: '14d5689f-311d-4031-ac9f-39b090d11ddd', productId: 'a1111111-1111-1111-1111-111111111111', imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '74f52bd1-f857-4ad3-a126-2984879c59a6', productId: 'a2222222-2222-2222-2222-222222222222', imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '53ba54f5-647d-4858-ad8e-3f465485053e', productId: 'a3333333-3333-3333-3333-333333333333', imageUrl: 'https://images.unsplash.com/photo-1545816250-e12db0587e1a?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: 'c21cb0b6-2fdc-47bb-9b0b-e4ee29bd5281', productId: 'b1111111-1111-1111-1111-111111111111', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '59b723b6-9a02-4383-a705-ae2c2f984d68', productId: 'b2222222-2222-2222-2222-222222222222', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '82f01d3f-2d16-4d7a-ab47-8f4b1b994cda', productId: 'b3333333-3333-3333-3333-333333333333', imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '8b39b079-3247-44cf-be2b-232c0f1bb9fe', productId: 'c1111111-1111-1111-1111-111111111111', imageUrl: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '1b65c98f-2ee1-4250-bac3-43d6f50d6221', productId: 'c2222222-2222-2222-2222-222222222222', imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '996930f0-46af-4ccc-b5c6-67c4754dc897', productId: 'c3333333-3333-3333-3333-333333333333', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '6c87b7f0-30c0-4bb4-8f31-442ece26888f', productId: 'd1111111-1111-1111-1111-111111111111', imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: 'ae192739-9ded-4df4-baea-cbc97605c7f1', productId: 'd2222222-2222-2222-2222-222222222222', imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
    { id: '270da241-3425-433c-b39f-eb6d21b3990a', productId: 'd3333333-3333-3333-3333-333333333333', imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400', imageType: 'THUMBNAIL', isThumbnail: true },
  ],
  productOptions: [
    { id: 12, product_id: 'a1111111-1111-1111-1111-111111111111', option_name: '수량', option_value: '10미 (기본)', price: 0, sort_order: 1 },
    { id: 13, product_id: 'a1111111-1111-1111-1111-111111111111', option_name: '수량', option_value: '15미 (+15,000원)', price: 15000, sort_order: 2 },
    { id: 14, product_id: 'a2222222-2222-2222-2222-222222222222', option_name: '중량', option_value: '1kg (기본)', price: 0, sort_order: 1 },
    { id: 15, product_id: 'a2222222-2222-2222-2222-222222222222', option_name: '중량', option_value: '2kg (+30,000원)', price: 30000, sort_order: 2 },
    { id: 16, product_id: 'a3333333-3333-3333-3333-333333333333', option_name: '크기', option_value: '중 (기본)', price: 0, sort_order: 1 },
    { id: 17, product_id: 'a3333333-3333-3333-3333-333333333333', option_name: '크기', option_value: '대 (+10,000원)', price: 10000, sort_order: 2 },
    { id: 18, product_id: 'b1111111-1111-1111-1111-111111111111', option_name: '수량', option_value: '5마리 (기본)', price: 0, sort_order: 1 },
    { id: 19, product_id: 'b2222222-2222-2222-2222-222222222222', option_name: '수량', option_value: '3마리 (기본)', price: 0, sort_order: 1 },
    { id: 20, product_id: 'b3333333-3333-3333-3333-333333333333', option_name: '중량', option_value: '500g (기본)', price: 0, sort_order: 1 },
    { id: 21, product_id: 'c1111111-1111-1111-1111-111111111111', option_name: '수량', option_value: '1마리 (기본)', price: 0, sort_order: 1 },
    { id: 22, product_id: 'c2222222-2222-2222-2222-222222222222', option_name: '수량', option_value: '2마리 (기본)', price: 0, sort_order: 1 },
    { id: 23, product_id: 'c3333333-3333-3333-3333-333333333333', option_name: '중량', option_value: '500g (기본)', price: 0, sort_order: 1 },
    { id: 24, product_id: 'd1111111-1111-1111-1111-111111111111', option_name: '중량', option_value: '500g (기본)', price: 0, sort_order: 1 },
    { id: 25, product_id: 'd1111111-1111-1111-1111-111111111111', option_name: '중량', option_value: '1kg (+25,000원)', price: 25000, sort_order: 2 },
    { id: 26, product_id: 'd2222222-2222-2222-2222-222222222222', option_name: '중량', option_value: '300g (기본)', price: 0, sort_order: 1 },
    { id: 27, product_id: 'd3333333-3333-3333-3333-333333333333', option_name: '중량', option_value: '300g (기본)', price: 0, sort_order: 1 },
  ],
  productExposureCategories: [
    { product_id: 'a1111111-1111-1111-1111-111111111111', exposure_category_id: 1 },
    { product_id: 'a1111111-1111-1111-1111-111111111111', exposure_category_id: 2 },
    { product_id: 'a2222222-2222-2222-2222-222222222222', exposure_category_id: 1 },
    { product_id: 'a3333333-3333-3333-3333-333333333333', exposure_category_id: 2 },
    { product_id: 'b1111111-1111-1111-1111-111111111111', exposure_category_id: 1 },
    { product_id: 'b1111111-1111-1111-1111-111111111111', exposure_category_id: 4 },
    { product_id: 'b2222222-2222-2222-2222-222222222222', exposure_category_id: 2 },
    { product_id: 'b3333333-3333-3333-3333-333333333333', exposure_category_id: 4 },
    { product_id: 'c1111111-1111-1111-1111-111111111111', exposure_category_id: 1 },
    { product_id: 'c2222222-2222-2222-2222-222222222222', exposure_category_id: 5 },
    { product_id: 'c3333333-3333-3333-3333-333333333333', exposure_category_id: 2 },
    { product_id: 'd1111111-1111-1111-1111-111111111111', exposure_category_id: 3 },
    { product_id: 'd1111111-1111-1111-1111-111111111111', exposure_category_id: 1 },
    { product_id: 'd2222222-2222-2222-2222-222222222222', exposure_category_id: 3 },
    { product_id: 'd3333333-3333-3333-3333-333333333333', exposure_category_id: 3 },
  ],
  banners: [
    { id: 10, title: '봉선장 신선수산 GRAND OPEN', image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=400&fit=crop', link_url: '/category/제철수산', banner_position_id: 1, is_active: true, sort_no: 1 },
    { id: 11, title: '제철 수산물 할인전', image_url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&h=400&fit=crop', link_url: '/category/제철수산', banner_position_id: 1, is_active: true, sort_no: 2 },
    { id: 12, title: '급랭 수산물 특가', image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop', link_url: '/category/당일수산', banner_position_id: 1, is_active: true, sort_no: 3 },
  ],
};

async function syncSequences(): Promise<void> {
  const sequenceResets = [
    { table: 'notices', column: 'id' },
    { table: 'notice_types', column: 'id' },
    { table: 'banners', column: 'id' },
    { table: 'banner_positions', column: 'id' },
    { table: 'faq_categories', column: 'id' },
    { table: 'faqs', column: 'id' },
    { table: 'shipping_policies', column: 'id' },
    { table: 'exposure_categories', column: 'id' },
    { table: 'product_options', column: 'id' },
  ];
  for (const { table, column } of sequenceResets) {
    try {
      await AppDataSource.manager.query(
        `SELECT setval(pg_get_serial_sequence('${table}', '${column}'), COALESCE((SELECT MAX(${column}) FROM ${table}), 0))`
      );
    } catch {
    }
  }
  console.log('Sequences synced');
}

export async function runProductionSeed(): Promise<void> {
  const productCount = await AppDataSource.manager.query('SELECT COUNT(*) as count FROM products');
  if (parseInt(productCount[0].count) > 0) {
    console.log('Database already has data, skipping seed');
    await syncSequences();
    return;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    console.log('Starting production database seed...');
    
    await queryRunner.startTransaction();

    for (const sp of seedData.shippingPolicies) {
      await queryRunner.query(
        `INSERT INTO shipping_policies (id, shipping_fee, description, is_active) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [sp.id, sp.shipping_fee, sp.description, sp.is_active]
      );
    }
    console.log('Seeded shipping policies');

    for (const cat of seedData.productCategories) {
      await queryRunner.query(
        `INSERT INTO product_categories (id, name, "sortOrder", "isActive") VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.sortOrder, cat.isActive]
      );
    }
    console.log('Seeded product categories');

    for (const ec of seedData.exposureCategories) {
      await queryRunner.query(
        `INSERT INTO exposure_categories (id, name, sort_order) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [ec.id, ec.name, ec.sort_order]
      );
    }
    console.log('Seeded exposure categories');

    for (const bp of seedData.bannerPositions) {
      await queryRunner.query(
        `INSERT INTO banner_positions (id, code, name, sort_no, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [bp.id, bp.code, bp.name, bp.sort_no, bp.is_active]
      );
    }
    console.log('Seeded banner positions');

    for (const nt of seedData.noticeTypes) {
      await queryRunner.query(
        `INSERT INTO notice_types (id, code, name, "sortNo", "isActive") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [nt.id, nt.code, nt.name, nt.sortNo, nt.isActive]
      );
    }
    console.log('Seeded notice types');

    for (const iit of seedData.investmentInfoTypes) {
      await queryRunner.query(
        `INSERT INTO investment_info_types (id, code, name, "sortNo", "isActive") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [iit.id, iit.code, iit.name, iit.sortNo, iit.isActive]
      );
    }
    console.log('Seeded investment info types');

    for (const p of seedData.products) {
      await queryRunner.query(
        `INSERT INTO products (id, name, base_price, product_category_id, shipping_policy_id, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.base_price, p.product_category_id, p.shipping_policy_id, p.stock_quantity]
      );
    }
    console.log('Seeded products');

    for (const img of seedData.productImages) {
      await queryRunner.query(
        `INSERT INTO product_images (id, "productId", "imageUrl", "imageType", "isThumbnail") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [img.id, img.productId, img.imageUrl, img.imageType, img.isThumbnail]
      );
    }
    console.log('Seeded product images');

    for (const opt of seedData.productOptions) {
      await queryRunner.query(
        `INSERT INTO product_options (id, product_id, option_name, option_value, price, sort_order) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [opt.id, opt.product_id, opt.option_name, opt.option_value, opt.price, opt.sort_order]
      );
    }
    console.log('Seeded product options');

    for (const pec of seedData.productExposureCategories) {
      await queryRunner.query(
        `INSERT INTO product_exposure_categories (product_id, exposure_category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [pec.product_id, pec.exposure_category_id]
      );
    }
    console.log('Seeded product exposure categories');

    for (const b of seedData.banners) {
      await queryRunner.query(
        `INSERT INTO banners (id, title, image_url, link_url, banner_position_id, is_active, sort_no) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
        [b.id, b.title, b.image_url, b.link_url, b.banner_position_id, b.is_active, b.sort_no]
      );
    }
    console.log('Seeded banners');

    await queryRunner.commitTransaction();
    await syncSequences();
    console.log('Production seed completed successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Failed to seed production database:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
