-- =====================================================
-- 봉선장 프로덕션 DB 시드 데이터
-- 실행 방법: Replit Database 패널 > Production DB > SQL 실행
-- =====================================================

-- =====================================================
-- 기존 데이터 삭제 (순서 중요 - FK 관계 고려)
-- =====================================================
DELETE FROM review_images;
DELETE FROM reviews;
DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM wishlist_items;
DELETE FROM product_exposure_categories;
DELETE FROM product_images;
DELETE FROM product_options;
DELETE FROM products;
DELETE FROM banners;
DELETE FROM events;
DELETE FROM bongseonjang_tv;
DELETE FROM faqs;
DELETE FROM notices;

-- =====================================================
-- 1. 상품 카테고리 (이미 존재하면 SKIP)
-- =====================================================
INSERT INTO product_categories (id, name, "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES 
  ('11111111-1111-1111-1111-111111111111', '제철수산', 1, true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '당일수산', 2, true, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', '손질수산', 3, true, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', '반건조/건조', 4, true, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', '젓갈/액젓', 5, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. 배송 정책 (이미 존재하면 SKIP)
-- =====================================================
INSERT INTO shipping_policies (id, shipping_fee, description, is_active, created_at, updated_at)
VALUES 
  (1, 0, '무료 배송', true, NOW(), NOW()),
  (2, 3000, '기본 배송비', true, NOW(), NOW()),
  (3, 5000, '도서산간 배송비', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. 상품 데이터 (20개)
-- =====================================================

-- 제철수산 (5개)
INSERT INTO products (id, name, base_price, stock_quantity, product_category_id, shipping_policy_id, detail_content, created_at, updated_at)
VALUES
  ('p0000001-0001-0001-0001-000000000001', '통영 생굴 1kg (프리미엄)', 25000, 100, '11111111-1111-1111-1111-111111111111', 2, '<p>통영 청정해역에서 당일 채취한 신선한 생굴입니다. 크리미한 식감과 바다향이 일품입니다.</p><ul><li>원산지: 경남 통영</li><li>보관방법: 냉장보관 (0~5°C)</li><li>유통기한: 수령 후 3일 이내</li></ul>', NOW(), NOW()),
  ('p0000001-0001-0001-0001-000000000002', '제주 은갈치 (특대) 2마리', 35000, 80, '11111111-1111-1111-1111-111111111111', 2, '<p>제주 청정해역에서 잡은 은빛 갈치입니다. 살이 두툼하고 기름기가 풍부합니다.</p><ul><li>원산지: 제주도</li><li>크기: 특대 (70cm 이상)</li><li>보관방법: 냉동보관</li></ul>', NOW(), NOW()),
  ('p0000001-0001-0001-0001-000000000003', '완도 전복 (중) 10마리', 45000, 60, '11111111-1111-1111-1111-111111111111', 1, '<p>완도 청정해역에서 자연 양식한 전복입니다. 쫄깃한 식감이 일품입니다.</p><ul><li>원산지: 전남 완도</li><li>크기: 중 (8~9cm)</li><li>손질 서비스 가능</li></ul>', NOW(), NOW()),
  ('p0000001-0001-0001-0001-000000000004', '여수 돌문어 (자연산) 1마리', 38000, 40, '11111111-1111-1111-1111-111111111111', 2, '<p>여수 앞바다에서 잡은 자연산 돌문어입니다. 쫄깃하고 담백한 맛이 특징입니다.</p><ul><li>원산지: 전남 여수</li><li>중량: 1~1.2kg</li><li>회/숙회 가능</li></ul>', NOW(), NOW()),
  ('p0000001-0001-0001-0001-000000000005', '울진 대게 (수컷) 1마리', 55000, 30, '11111111-1111-1111-1111-111111111111', 2, '<p>울진 앞바다에서 잡은 싱싱한 대게입니다. 꽉 찬 게살이 일품입니다.</p><ul><li>원산지: 경북 울진</li><li>중량: 800g~1kg</li><li>활어/급냉 선택 가능</li></ul>', NOW(), NOW());

-- 당일수산 (5개)
INSERT INTO products (id, name, base_price, stock_quantity, product_category_id, shipping_policy_id, detail_content, created_at, updated_at)
VALUES
  ('p0000002-0002-0002-0002-000000000001', '활 광어 (자연산) 1마리', 42000, 50, '22222222-2222-2222-2222-222222222222', 2, '<p>서해안에서 당일 입수한 자연산 광어입니다. 쫄깃한 회 맛이 일품입니다.</p><ul><li>원산지: 서해안</li><li>중량: 1.5~2kg</li><li>회/세꼬시 가능</li></ul>', NOW(), NOW()),
  ('p0000002-0002-0002-0002-000000000002', '활 우럭 (자연산) 2마리', 32000, 70, '22222222-2222-2222-2222-222222222222', 2, '<p>남해안에서 잡은 싱싱한 자연산 우럭입니다. 탱탱한 살이 일품입니다.</p><ul><li>원산지: 남해안</li><li>중량: 마리당 500~600g</li><li>매운탕/구이용 가능</li></ul>', NOW(), NOW()),
  ('p0000002-0002-0002-0002-000000000003', '활 꽃게 (암컷) 3마리', 28000, 90, '22222222-2222-2222-2222-222222222222', 2, '<p>서해에서 잡은 살찐 암꽃게입니다. 게장/찜으로 최고입니다.</p><ul><li>원산지: 서해안</li><li>크기: 대 (15cm 이상)</li><li>게장용 추천</li></ul>', NOW(), NOW()),
  ('p0000002-0002-0002-0002-000000000004', '활 바지락 1kg', 12000, 150, '22222222-2222-2222-2222-222222222222', 2, '<p>갯벌에서 캔 신선한 바지락입니다. 조개탕, 칼국수에 최고입니다.</p><ul><li>원산지: 충남 서천</li><li>해감 완료</li><li>냉장 배송</li></ul>', NOW(), NOW()),
  ('p0000002-0002-0002-0002-000000000005', '활 전어 (대) 10마리', 18000, 80, '22222222-2222-2222-2222-222222222222', 2, '<p>가을 전어는 집 나간 며느리도 돌아온다! 기름진 가을 전어입니다.</p><ul><li>원산지: 남해안</li><li>크기: 대 (20cm 이상)</li><li>회/구이용</li></ul>', NOW(), NOW());

-- 손질수산 (4개)
INSERT INTO products (id, name, base_price, stock_quantity, product_category_id, shipping_policy_id, detail_content, created_at, updated_at)
VALUES
  ('p0000003-0003-0003-0003-000000000001', '손질 고등어 (순살) 5팩', 22000, 100, '33333333-3333-3333-3333-333333333333', 2, '<p>뼈를 제거한 순살 고등어입니다. 바로 구워드시면 됩니다.</p><ul><li>원산지: 국내산</li><li>1팩: 150g</li><li>냉동 배송</li></ul>', NOW(), NOW()),
  ('p0000003-0003-0003-0003-000000000002', '손질 삼치 (스테이크) 4팩', 26000, 80, '33333333-3333-3333-3333-333333333333', 2, '<p>먹기 좋게 스테이크로 손질한 삼치입니다. 구이/조림 모두 가능합니다.</p><ul><li>원산지: 국내산</li><li>1팩: 200g</li><li>냉동 배송</li></ul>', NOW(), NOW()),
  ('p0000003-0003-0003-0003-000000000003', '손질 오징어 (국내산) 5마리', 19000, 120, '33333333-3333-3333-3333-333333333333', 2, '<p>내장 제거 후 깨끗이 손질한 오징어입니다.</p><ul><li>원산지: 동해안</li><li>중량: 마리당 200~250g</li><li>볶음/튀김용</li></ul>', NOW(), NOW()),
  ('p0000003-0003-0003-0003-000000000004', '손질 새우 (탈각) 500g', 24000, 90, '33333333-3333-3333-3333-333333333333', 2, '<p>껍질을 벗긴 탈각 새우입니다. 바로 요리 가능합니다.</p><ul><li>원산지: 국내산</li><li>크기: 대하 (40~50미)</li><li>냉동 배송</li></ul>', NOW(), NOW());

-- 반건조/건조 (3개)
INSERT INTO products (id, name, base_price, stock_quantity, product_category_id, shipping_policy_id, detail_content, created_at, updated_at)
VALUES
  ('p0000004-0004-0004-0004-000000000001', '반건조 고등어 5마리', 28000, 70, '44444444-4444-4444-4444-444444444444', 2, '<p>하루 동안 해풍에 말린 반건조 고등어입니다. 짭조름하고 쫄깃합니다.</p><ul><li>원산지: 국내산</li><li>크기: 대 (350g 이상)</li><li>에어프라이어 추천</li></ul>', NOW(), NOW()),
  ('p0000004-0004-0004-0004-000000000002', '황태채 200g (프리미엄)', 18000, 100, '44444444-4444-4444-4444-444444444444', 2, '<p>강원도 황태덕장에서 만든 프리미엄 황태채입니다.</p><ul><li>원산지: 강원도 인제</li><li>용도: 황태국, 무침</li><li>상온 보관</li></ul>', NOW(), NOW()),
  ('p0000004-0004-0004-0004-000000000003', '마른 오징어 10마리', 32000, 60, '44444444-4444-4444-4444-444444444444', 2, '<p>동해안 오징어를 해풍에 말린 마른 오징어입니다.</p><ul><li>원산지: 강원도 속초</li><li>크기: 대 (30cm 이상)</li><li>안주/간식</li></ul>', NOW(), NOW());

-- 젓갈/액젓 (3개)
INSERT INTO products (id, name, base_price, stock_quantity, product_category_id, shipping_policy_id, detail_content, created_at, updated_at)
VALUES
  ('p0000005-0005-0005-0005-000000000001', '새우젓 (추젓) 1kg', 35000, 80, '55555555-5555-5555-5555-555555555555', 2, '<p>가을에 담근 추젓입니다. 김장용으로 최고입니다.</p><ul><li>원산지: 신안</li><li>숙성: 6개월</li><li>냉장 보관</li></ul>', NOW(), NOW()),
  ('p0000005-0005-0005-0005-000000000002', '명란젓 500g (프리미엄)', 42000, 50, '55555555-5555-5555-5555-555555555555', 2, '<p>강원도에서 만든 프리미엄 명란젓입니다. 밥도둑!</p><ul><li>원산지: 강원도 속초</li><li>매운맛/순한맛 선택</li><li>냉장 배송</li></ul>', NOW(), NOW()),
  ('p0000005-0005-0005-0005-000000000003', '까나리 액젓 1.8L', 15000, 120, '55555555-5555-5555-5555-555555555555', 2, '<p>100% 국내산 까나리로 만든 전통 액젓입니다.</p><ul><li>원산지: 전남 신안</li><li>숙성: 2년</li><li>김치/요리용</li></ul>', NOW(), NOW());

-- =====================================================
-- 4. 상품 옵션
-- =====================================================
INSERT INTO product_options (product_id, option_name, option_value, price, sort_order, created_at)
VALUES
  -- 통영 생굴
  ('p0000001-0001-0001-0001-000000000001', '용량', '1kg', 0, 1, NOW()),
  ('p0000001-0001-0001-0001-000000000001', '용량', '2kg', 23000, 2, NOW()),
  ('p0000001-0001-0001-0001-000000000001', '용량', '3kg', 45000, 3, NOW()),
  -- 제주 은갈치
  ('p0000001-0001-0001-0001-000000000002', '수량', '2마리', 0, 1, NOW()),
  ('p0000001-0001-0001-0001-000000000002', '수량', '4마리', 32000, 2, NOW()),
  -- 완도 전복
  ('p0000001-0001-0001-0001-000000000003', '크기', '중 (8~9cm)', 0, 1, NOW()),
  ('p0000001-0001-0001-0001-000000000003', '크기', '대 (10~11cm)', 15000, 2, NOW()),
  ('p0000001-0001-0001-0001-000000000003', '크기', '특대 (12cm 이상)', 30000, 3, NOW()),
  -- 활 광어
  ('p0000002-0002-0002-0002-000000000001', '중량', '1.5~2kg', 0, 1, NOW()),
  ('p0000002-0002-0002-0002-000000000001', '중량', '2~2.5kg', 18000, 2, NOW()),
  -- 손질 고등어
  ('p0000003-0003-0003-0003-000000000001', '수량', '5팩', 0, 1, NOW()),
  ('p0000003-0003-0003-0003-000000000001', '수량', '10팩', 20000, 2, NOW()),
  -- 새우젓
  ('p0000005-0005-0005-0005-000000000001', '용량', '1kg', 0, 1, NOW()),
  ('p0000005-0005-0005-0005-000000000001', '용량', '2kg', 33000, 2, NOW()),
  -- 명란젓
  ('p0000005-0005-0005-0005-000000000002', '맛', '순한맛', 0, 1, NOW()),
  ('p0000005-0005-0005-0005-000000000002', '맛', '매운맛', 0, 2, NOW());

-- =====================================================
-- 5. 상품 이미지 (Unsplash 사용)
-- =====================================================
INSERT INTO product_images (id, "productId", "imageUrl", "imageType", "sortOrder", "isThumbnail", "createdAt")
VALUES
  -- 통영 생굴
  (uuid_generate_v4(), 'p0000001-0001-0001-0001-000000000001', 'https://images.unsplash.com/photo-1606731219412-7d5e5f6d3e3c?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 제주 은갈치
  (uuid_generate_v4(), 'p0000001-0001-0001-0001-000000000002', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 완도 전복
  (uuid_generate_v4(), 'p0000001-0001-0001-0001-000000000003', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 여수 돌문어
  (uuid_generate_v4(), 'p0000001-0001-0001-0001-000000000004', 'https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 울진 대게
  (uuid_generate_v4(), 'p0000001-0001-0001-0001-000000000005', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 활 광어
  (uuid_generate_v4(), 'p0000002-0002-0002-0002-000000000001', 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 활 우럭
  (uuid_generate_v4(), 'p0000002-0002-0002-0002-000000000002', 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 활 꽃게
  (uuid_generate_v4(), 'p0000002-0002-0002-0002-000000000003', 'https://images.unsplash.com/photo-1550747545-c896b5c4e024?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 활 바지락
  (uuid_generate_v4(), 'p0000002-0002-0002-0002-000000000004', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 활 전어
  (uuid_generate_v4(), 'p0000002-0002-0002-0002-000000000005', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 손질 고등어
  (uuid_generate_v4(), 'p0000003-0003-0003-0003-000000000001', 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 손질 삼치
  (uuid_generate_v4(), 'p0000003-0003-0003-0003-000000000002', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 손질 오징어
  (uuid_generate_v4(), 'p0000003-0003-0003-0003-000000000003', 'https://images.unsplash.com/photo-1566932769119-7a1fb6d7ce23?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 손질 새우
  (uuid_generate_v4(), 'p0000003-0003-0003-0003-000000000004', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 반건조 고등어
  (uuid_generate_v4(), 'p0000004-0004-0004-0004-000000000001', 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 황태채
  (uuid_generate_v4(), 'p0000004-0004-0004-0004-000000000002', 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 마른 오징어
  (uuid_generate_v4(), 'p0000004-0004-0004-0004-000000000003', 'https://images.unsplash.com/photo-1566932769119-7a1fb6d7ce23?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 새우젓
  (uuid_generate_v4(), 'p0000005-0005-0005-0005-000000000001', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 명란젓
  (uuid_generate_v4(), 'p0000005-0005-0005-0005-000000000002', 'https://images.unsplash.com/photo-1583224994076-9af11e588c0b?w=600&h=600&fit=crop', 'main', 1, true, NOW()),
  -- 까나리 액젓
  (uuid_generate_v4(), 'p0000005-0005-0005-0005-000000000003', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=600&fit=crop', 'main', 1, true, NOW());

-- =====================================================
-- 6. 배너 포지션 (이미 존재하면 SKIP)
-- =====================================================
INSERT INTO banner_positions (id, code, name, sort_no, is_active)
VALUES 
  (1, 'HOME_HERO', '홈/히어로', 1, true),
  (2, 'HOME_MIDDLE', '홈/중간', 2, true),
  (3, 'HOME_BOTTOM', '홈/하단', 3, true),
  (4, 'HOME_EVENT', '홈/이벤트', 4, true),
  (5, 'MYPAGE', '마이페이지', 5, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. 배너
-- =====================================================
INSERT INTO banners (id, title, image_url, link_url, sort_no, is_active, banner_position_id, started_at, ended_at, created_at, updated_at)
VALUES
  (100, '봉선장 GRAND OPEN', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&h=600&fit=crop&q=80', '/event/1', 1, true, 1, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW()),
  (101, '제철 수산물 특가전', 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=1200&h=600&fit=crop&q=80', '/category/11111111-1111-1111-1111-111111111111', 2, true, 1, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW()),
  (102, '신선한 당일수산 20% 할인', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&h=600&fit=crop&q=80', '/category/22222222-2222-2222-2222-222222222222', 3, true, 1, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW()),
  (103, '손질수산 무료배송', 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=1200&h=600&fit=crop&q=80', '/category/33333333-3333-3333-3333-333333333333', 1, true, 2, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW()),
  (104, '프리미엄 젓갈 기획전', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=1200&h=600&fit=crop&q=80', '/category/55555555-5555-5555-5555-555555555555', 2, true, 2, NOW(), NOW() + INTERVAL '1 year', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  sort_no = EXCLUDED.sort_no,
  is_active = EXCLUDED.is_active,
  banner_position_id = EXCLUDED.banner_position_id,
  updated_at = NOW();

-- =====================================================
-- 8. 이벤트
-- =====================================================
INSERT INTO events (id, title, description, "imageUrl", "linkUrl", "startDate", "endDate", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('e0000001-0001-0001-0001-000000000001', '봉선장 GRAND OPEN 이벤트', '신규 오픈 기념! 전 상품 10% 할인 + 무료배송', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=400&fit=crop', '/products', NOW(), NOW() + INTERVAL '30 days', 1, true, NOW(), NOW()),
  ('e0000001-0001-0001-0001-000000000002', '가을 전어 축제', '집 나간 며느리도 돌아오는 가을 전어! 특가 판매', 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&h=400&fit=crop', '/product/p0000002-0002-0002-0002-000000000005', NOW(), NOW() + INTERVAL '14 days', 2, true, NOW(), NOW()),
  ('e0000001-0001-0001-0001-000000000003', '김장 시즌 젓갈 대전', '추젓, 명란젓 최대 30% 할인', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=400&fit=crop', '/category/55555555-5555-5555-5555-555555555555', NOW(), NOW() + INTERVAL '45 days', 3, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "imageUrl" = EXCLUDED."imageUrl",
  "updatedAt" = NOW();

-- =====================================================
-- 9. Exposure Categories (홈화면 섹션)
-- =====================================================
INSERT INTO exposure_categories (id, name, sort_order)
VALUES 
  (3, '바담은 제품', 3),
  (4, 'MD추천!', 4),
  (5, '이주의 상품', 5),
  (6, '봉쿡 제품', 6),
  (7, '봉선장 TV', 7),
  (8, '봉선장''s Brand', 8)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. 상품-Exposure 카테고리 연결
-- =====================================================
INSERT INTO product_exposure_categories (product_id, exposure_category_id)
VALUES
  -- 바담은 제품 (제철수산)
  ('p0000001-0001-0001-0001-000000000001', 3),
  ('p0000001-0001-0001-0001-000000000003', 3),
  ('p0000001-0001-0001-0001-000000000005', 3),
  -- MD추천!
  ('p0000001-0001-0001-0001-000000000002', 4),
  ('p0000002-0002-0002-0002-000000000001', 4),
  ('p0000005-0005-0005-0005-000000000002', 4),
  -- 이주의 상품
  ('p0000002-0002-0002-0002-000000000003', 5),
  ('p0000002-0002-0002-0002-000000000005', 5),
  ('p0000003-0003-0003-0003-000000000001', 5),
  -- 봉쿡 제품 (손질수산)
  ('p0000003-0003-0003-0003-000000000002', 6),
  ('p0000003-0003-0003-0003-000000000003', 6),
  ('p0000003-0003-0003-0003-000000000004', 6);

-- =====================================================
-- 11. 봉선장 TV
-- =====================================================
INSERT INTO bongseonjang_tv (id, title, description, "videoUrl", "thumbnailUrl", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('tv000001-0001-0001-0001-000000000001', '통영 생굴 손질법', '신선한 통영 생굴을 맛있게 즐기는 방법!', 'https://www.youtube.com/watch?v=example1', 'https://images.unsplash.com/photo-1606731219412-7d5e5f6d3e3c?w=400&h=300&fit=crop', 1, true, NOW(), NOW()),
  ('tv000001-0001-0001-0001-000000000002', '전복 버터구이 레시피', '완도 전복으로 만드는 고급 버터구이', 'https://www.youtube.com/watch?v=example2', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop', 2, true, NOW(), NOW()),
  ('tv000001-0001-0001-0001-000000000003', '꽃게찜 황금레시피', '서해 꽃게로 만드는 정통 꽃게찜', 'https://www.youtube.com/watch?v=example3', 'https://images.unsplash.com/photo-1550747545-c896b5c4e024?w=400&h=300&fit=crop', 3, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- =====================================================
-- 12. FAQ 카테고리
-- =====================================================
INSERT INTO faq_categories (id, name, "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('faqcat01-0001-0001-0001-000000000001', '배송', 1, true, NOW(), NOW()),
  ('faqcat01-0001-0001-0001-000000000002', '결제', 2, true, NOW(), NOW()),
  ('faqcat01-0001-0001-0001-000000000003', '교환/반품', 3, true, NOW(), NOW()),
  ('faqcat01-0001-0001-0001-000000000004', '상품', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. FAQ
-- =====================================================
INSERT INTO faqs (id, question, answer, "categoryId", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('faq00001-0001-0001-0001-000000000001', '배송은 얼마나 걸리나요?', '주문 후 1~2일 내 출고되며, 출고 후 1~2일 내 배송됩니다. 도서산간 지역은 2~3일 추가 소요될 수 있습니다.', 'faqcat01-0001-0001-0001-000000000001', 1, true, NOW(), NOW()),
  ('faq00001-0001-0001-0001-000000000002', '배송비는 얼마인가요?', '기본 배송비는 3,000원이며, 5만원 이상 구매 시 무료배송입니다. 도서산간 지역은 추가 배송비가 발생할 수 있습니다.', 'faqcat01-0001-0001-0001-000000000001', 2, true, NOW(), NOW()),
  ('faq00001-0001-0001-0001-000000000003', '어떤 결제 수단을 사용할 수 있나요?', '신용카드, 체크카드, 무통장입금, 카카오페이, 네이버페이를 지원합니다.', 'faqcat01-0001-0001-0001-000000000002', 1, true, NOW(), NOW()),
  ('faq00001-0001-0001-0001-000000000004', '교환/반품은 어떻게 하나요?', '수령 후 24시간 이내 고객센터로 연락주시면 교환/반품 처리해 드립니다. 단, 신선식품 특성상 단순 변심에 의한 반품은 어렵습니다.', 'faqcat01-0001-0001-0001-000000000003', 1, true, NOW(), NOW()),
  ('faq00001-0001-0001-0001-000000000005', '상품이 신선하게 도착하나요?', '모든 수산물은 아이스박스에 아이스팩과 함께 포장하여 배송됩니다. 신선도를 최우선으로 합니다.', 'faqcat01-0001-0001-0001-000000000004', 1, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  "updatedAt" = NOW();

-- =====================================================
-- 14. 공지사항 타입
-- =====================================================
INSERT INTO notice_types (id, name, "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('noticety1-0001-0001-0001-000000000001', '공지', 1, true, NOW(), NOW()),
  ('noticety1-0001-0001-0001-000000000002', '이벤트', 2, true, NOW(), NOW()),
  ('noticety1-0001-0001-0001-000000000003', '배송', 3, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 15. 공지사항
-- =====================================================
INSERT INTO notices (id, title, content, "typeId", "isImportant", "isActive", "viewCount", "createdAt", "updatedAt")
VALUES
  ('notice01-0001-0001-0001-000000000001', '봉선장 오픈 안내', '안녕하세요, 봉선장입니다. 저희 봉선장이 새롭게 오픈했습니다. 신선한 수산물을 합리적인 가격에 만나보세요!', 'noticety1-0001-0001-0001-000000000001', true, true, 0, NOW(), NOW()),
  ('notice01-0001-0001-0001-000000000002', 'GRAND OPEN 이벤트 안내', '오픈 기념 전 상품 10% 할인 + 5만원 이상 무료배송 이벤트를 진행합니다. 기간: 오픈 후 30일간', 'noticety1-0001-0001-0001-000000000002', true, true, 0, NOW(), NOW()),
  ('notice01-0001-0001-0001-000000000003', '겨울철 배송 안내', '겨울철에도 신선한 수산물 배송을 위해 보냉 포장을 강화했습니다. 아이스박스 + 보냉팩으로 안전하게 배송됩니다.', 'noticety1-0001-0001-0001-000000000003', false, true, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  "updatedAt" = NOW();

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT '시드 데이터 삽입 완료! 상품 20개, 배너 5개, 이벤트 3개, FAQ 5개, 공지사항 3개가 추가되었습니다.' AS result;
