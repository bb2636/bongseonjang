# 프로젝트명

## Overview
본 프로젝트는 사용자 친화적인 웹 애플리케이션을 구축하는 것을 목표로 합니다. 핵심 기능은 효율적인 사용자 인증 및 계정 관리 시스템을 포함하며, 확장 가능하고 유지보수하기 쉬운 아키텍처를 통해 견고한 서비스를 제공합니다. 비즈니스적으로는 사용자 경험을 최우선으로 하여 시장에서의 경쟁력을 확보하고, 지속적인 기능 확장을 통해 서비스 범위를 넓혀나갈 것입니다.

## User Preferences

### Naming Conventions
- 단수/복수를 정확하게 사용
- 서술적인 이름 사용
- 약어 사용 금지
- 전세계적으로 이해 가능한 용어 사용

### Code Structure and Style
- Early return 적극 활용
- 매직 넘버는 상수로 대체
- 관련 변수는 가까이 배치
- 의미 있는 공백 유지
- 부정 조건 최소화 (불가피할 경우 `isInvalid` 같은 메서드로 추출)

### Styling Rules
- **Vanilla CSS만 사용** (styled-components, emotion, tailwind 등 CSS-in-JS 라이브러리 사용 금지)
- CSS 변수를 통한 테마 관리 (colors, spacing, typography)
- 컴포넌트별 CSS 파일 분리 (예: `Component.tsx` + `Component.css`)
- BEM 네이밍 또는 feature 기반 클래스 네이밍 사용

### Method Principles
- 하나의 메서드는 하나의 책임만
- 리턴 타입 명확히 정의
- 선언 순서: `public → protected → private`
- 내부 순서: "상태 변경 → 검증 → 조회"
- 일관된 추상화 수준 유지

### Object-Oriented Design
- Getter/Setter 남용 금지
- 메시지 전달 중심 설계
- 불변 객체 지향
- 상속보다 조합/인터페이스 선호
- 유사한 값은 Value Object로 그룹화 (동등성, 유효성, 불변성 포함)
- 컬렉션은 일급 컬렉션으로 래핑하여 불변성 확보
- Enum 적극 활용 (필요시 설명 필드 포함)

### Code Quality
- 주석에 의존하지 말고 코드로 의도 표현
- 리팩토링 순서: "중복 제거 → 메서드 추출 → 객체 분리 → 도메인 개념으로 추상화"
- SOLID 원칙 적용

### Development Process
- **중요**: 구현 전 반드시 계획을 제안하고 사용자 승인을 받을 것
- 개발 완료 후에도 사용자 승인을 받을 것

### Git Workflow
- **Git Flow** 사용
  - `main`: 프로덕션 브랜치
  - `develop`: 개발 브랜치
  - `feature/*`: 기능 개발 브랜치
  - `hotfix/*`: 긴급 수정 브랜치
  - `release/*`: 릴리즈 준비 브랜치
- **커밋 메시지 형식**:
```
feat: 간단한 제목

상세 설명 1
상세 설명 2
상세 설명 3
```
- **커밋 타입**:
  - `feat`: 새로운 기능
  - `fix`: 버그 수정
  - `refactor`: 코드 리팩토링
  - `style`: 코드 스타일 변경 (포맷팅 등)
  - `docs`: 문서 변경
  - `test`: 테스트 추가/수정
  - `chore`: 빌드, 설정 파일 변경

### Replit Agent 협업 규칙
- **중요**: Replit Agent는 코드 변경 시 자동으로 커밋을 생성함 (비활성화 불가)
- **워크플로우**:
  1. Agent가 코드 변경 완료
  2. Agent가 커밋 메시지 제안 및 "**커밋 메시지를 수정해주세요!**" 표시
  3. 사용자가 `git commit --amend`로 메시지 수정
  4. 사용자가 `git push` 실행
- **역할 분담**:

| 역할 | 담당 |
|------|------|
| Agent | 코드 변경, 커밋 메시지 제안, 수정 알림 |
| 사용자 | 커밋 메시지 수정, push |

## System Architecture

### Frontend Architecture (Hook-First Pattern)
프론트엔드는 Hook-First 패턴을 따르며, Context, Api, Service, Hook, Page, View 레이어로 구성됩니다. Page는 Hook 호출 후 View에 props를 전달하고, View는 UI 렌더링만 담당합니다. 모든 페이지는 Hook과 View로 분리되어야 하며, Page 파일에는 CSS import를 금지하고, View는 순수 프레젠테이션 컴포넌트여야 합니다.

**프론트엔드 폴더 구조:**
`src/` 아래에 `features/`, `components/`, `contexts/`, `hooks/`, `layouts/`, `services/`, `api/`, `assets/`, `styles/` 등의 폴더를 가집니다.

### State Management
- **전역 상태**: React Context 사용.
- **서버 상태**: React Query 사용 (5분 staleTime 캐싱, `keepPreviousData`, Query Key에 사용자 ID 포함).
- **기능별 상태**: Custom Hook으로 캡슐화.
- **멀티 스텝 폼**: Context Provider와 Step별 Hook 분리 패턴 사용.

### React Query 패턴
`useQuery`는 데이터 조회에, `useMutation`은 데이터 변경에 사용되며, 로딩 상태는 `mutation.isPending`으로 관리합니다.

### Backend Architecture (Clean Architecture + Feature-Based)
백엔드는 Clean Architecture를 따르며, 기능(Feature)별로 폴더를 구성합니다. 각 Feature 내에서 Controller, Application, Domain, Repository, Routes 레이어가 단방향 의존성을 유지합니다.

**백엔드 폴더 구조:**
```
server/
├── features/                    # 기능별 모듈 (auth, emailVerification, referral, home 등)
│   ├── [feature_name]/
│   │   ├── controller/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── repository/
│   │   ├── routes/
│   │   └── index.ts
├── common/                      # 공통 모듈 (middleware, services)
├── config/                      # 설정 (database, repositories)
├── entity/                      # TypeORM 엔티티
├── routes/                      # 라우트 집계
└── index.ts                     # 서버 엔트리
```

### Repository Pattern (Clean Architecture)
Repository는 DB 접근 및 TypeORM Entity를 반환하며, Service에서 비즈니스 로직 처리 및 DTO로 변환합니다. Mock/Real 스위칭을 지원하는 Generic Factory + Map 캐싱 패턴을 사용합니다.

### UI/UX Patterns
- **CSS 변수**: 일관된 테마 적용.
- **전역 토스트 알림 시스템**.
- **공통 Input/PasswordInput 컴포넌트**: 일관된 폼 스타일링.
- **반응형 디자인**: 공통 컴포넌트를 활용.
- **스켈레톤 로딩**: UX 개선.

### CompletionScreen 공용 컴포넌트
회원가입 완료, 비밀번호 변경 완료 등 완료 화면에서 재사용되는 공용 컴포넌트입니다.

### Home Feature (홈 화면)
홈 화면은 feature-first 레이아웃 전략을 사용하며, 자체 AppBar/BottomNav를 가집니다. HeroBanner는 Swiper.js를 사용하여 자동 재생, 무한 루프, 페이지네이션 dots 기능을 제공합니다.

### Product Image (상품 이미지)
상품 이미지는 `product_images` 테이블에서 관리되며, `isThumbnail` 플래그와 Partial Unique Index를 사용하여 상품당 하나의 썸네일만 허용합니다.

### Review Feature (리뷰 시스템)
상품에 대한 리뷰 및 평점 관리 기능으로, `reviews` 테이블에 저장되며 상품 리뷰 목록, 통계 조회, 작성, 삭제 API를 제공합니다.

### Product Detail Tabs (상품 상세 탭)
상품 상세페이지의 탭 네비게이션 컴포넌트로 "상품정보", "후기 N", "문의" 탭으로 구성됩니다. ProductService는 ReviewService를 주입받아 리뷰 통계를 가져옵니다.

### Two-Level Product Options (2단계 상품 옵션)
상품 옵션은 2단계 구조로 관리됩니다:
- **MainOption**: 중량/용량 선택 (예: 소 300g, 중 500g, 대 1kg) - 기본 가격 결정
- **SubOption**: 맛/스타일 선택 (예: 양념, 간장) - 추가 금액
- **lowestPrice**: 활성화된 MainOption 중 최저가 자동 계산
- **OptionBottomSheet**: 구매 버튼 클릭 시 2단계 옵션 선택 바텀시트 표시
- **레거시 지원**: mainOptions가 없는 상품은 기존 ProductOptions 컴포넌트 사용

**DB 테이블:**
- `product_main_options`: groupName, name, price, compareAtPrice, stockQty
- `product_sub_options`: groupName, name, additionalPrice, stockQty

### Category Feature (카테고리 페이지)
바텀 네비게이션에서 카테고리 탭 클릭 시 표시되는 전용 페이지입니다.
- **CategoryAppBar**: 봉선장 로고 + 장바구니 아이콘 (개수 배지 지원)
- **CategoryList**: 51px 높이 항목, 15px medium 폰트, 구분선
- **카테고리 목록**: 전체, 신상품, 베스트, 제철 수산물, 급랭 수산물, 손질 수산물, 바담은 절임류
- **카테고리 클릭**: 홈페이지의 해당 탭으로 이동 (쿼리 파라미터 사용)

### Profile Feature (봉크루/마이페이지)
사용자 프로필 및 주문 관리 페이지입니다.
- **ProfileAppBar**: 타이틀 + 장바구니 아이콘
- **ProfileHeader**: 인사말, 등급, 프로필 수정 버튼
- **SummaryCard**: 포인트/쿠폰/찜 현황 + 작성 가능한 리뷰
- **RecentOrders**: 진행 중 주문 현황
- **MenuList**: 쇼핑정보/고객센터 메뉴 섹션

## Database Schema

### 기존 테이블
| 모듈 | 테이블 |
|------|--------|
| 사용자 | users, email_verification_tokens |
| 상품 | products, product_categories, display_categories |
| 상품 옵션 | product_main_options, product_sub_options, product_options |
| 이미지 | product_images |
| 리뷰 | reviews |
| 콘텐츠 | hero_banners, middle_banners, bottom_banners, bongseonjang_tv |
| 프로모션 | time_deals, events |
| 검색 | search_terms |

### 장바구니/주문 테이블 (2025.12.11 추가)
- **carts**: 장바구니 (userId, guestToken, isActive)
- **cart_items**: 장바구니 상품 (cartId, productId, mainOptionId, subOptionId, quantity)
- **orders**: 주문 (orderNumber, userId, status, 금액 정보, 배송지 정보)
- **order_items**: 주문 상품 - 스냅샷 저장 (productName, optionName, unitPrice)
- **order_status_history**: 주문 상태 변경 이력

### 배송 테이블
- **shipping_addresses**: 배송지 목록 (userId, addressName, recipientName, address)
- **shipments**: 배송 정보 (orderId, carrierCode, trackingNumber, status)
- **shipment_events**: 배송 추적 이벤트

### 결제 테이블
- **payments**: 결제 정보 (orderId, method, amount, pgProvider)
- **payment_refunds**: 환불 내역

### 쿠폰 테이블
- **coupons**: 쿠폰 정의 (code, discountType, discountValue, validFrom/To)
- **coupon_issuances**: 사용자별 쿠폰 발급 내역

### 포인트 테이블
- **point_wallets**: 사용자별 포인트 잔액 (OneToOne with users)
- **point_transactions**: 포인트 적립/사용 내역 (type, amount, expiresAt)

### 찜 테이블
- **wishlists**: 사용자별 찜 목록 (OneToOne with users)
- **wishlist_items**: 찜한 상품 (Unique: wishlistId + productId)

### 고객센터 테이블
- **support_tickets**: 문의 티켓 (ticketNumber, category, status)
- **support_messages**: 문의 메시지 (ticketId, senderType, content)

### 설계 원칙
- **스냅샷 저장**: 주문 시점의 가격/옵션을 OrderItem에 복사 저장
- **상태 이력 관리**: order_status_history, shipment_events로 변경 추적
- **포인트 만료**: point_transactions.expiresAt으로 만료 관리
- **Soft Delete**: 배송지 등은 isActive 플래그로 논리 삭제

## External Dependencies
- **React 18**: 프론트엔드 라이브러리
- **Vite**: 빌드 도구
- **Vanilla CSS**: 스타일링
- **React Query**: 서버 상태 관리
- **Swiper.js**: 이미지 슬라이더/캐러셀
- **Express.js**: 백엔드 프레임워크
- **TypeORM**: ORM
- **PostgreSQL**: 데이터베이스
- **bcrypt**: 비밀번호 해싱
- **jsonwebtoken**: JWT 토큰