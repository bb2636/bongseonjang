# 봉크루 (Bongkru)

## Overview
본 프로젝트는 사용자 친화적인 이커머스 웹 애플리케이션 구축을 목표로 합니다. 효율적인 사용자 인증 및 계정 관리 시스템을 포함하며, 확장 가능하고 유지보수하기 쉬운 아키텍처를 통해 견고한 서비스를 제공합니다.

## Project Structure (Monorepo)
```
bongkru/
├── apps/
│   ├── frontend/          # React + Vite 프론트엔드
│   │   ├── src/           # 소스 코드
│   │   ├── public/        # 정적 파일
│   │   ├── package.json   # 프론트엔드 의존성
│   │   └── vite.config.ts # Vite 설정
│   └── backend/           # Express + TypeORM 백엔드
│       ├── entity/        # TypeORM 엔티티
│       ├── features/      # 기능별 모듈
│       ├── package.json   # 백엔드 의존성
│       └── index.ts       # 서버 진입점
├── packages/
│   └── contract/          # 공용 타입 패키지
│       ├── src/           # 타입 정의 파일
│       └── package.json   # 패키지 설정
├── pnpm-workspace.yaml    # pnpm 워크스페이스 설정
└── package.json           # 루트 스크립트
```

### Commands
- `pnpm install` - 모든 의존성 설치
- `pnpm dev` - 개발 서버 실행 (프론트엔드 + 백엔드)
- `pnpm build` - 프로덕션 빌드
- `pnpm --filter @bongkru/frontend dev` - 프론트엔드만 실행
- `pnpm --filter @bongkru/backend dev` - 백엔드만 실행

### Shared Types (@bongkru/contract)
프론트엔드와 백엔드에서 공용으로 사용하는 타입 정의:
```typescript
import { LoginRequest, ProductDto, OrderStatus } from '@bongkru/contract';
```

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
프론트엔드는 Hook-First 패턴을 따르며, Context, Api, Service, Hook, Page, View 레이어로 구성됩니다. Page는 Hook 호출 후 View에 props를 전달하고, View는 UI 렌더링만 담당합니다. 모든 페이지는 Hook과 View로 분리되어야 하며, Page 파일에는 CSS import를 금지하고, View는 순수 프레젠테이션 컴포넌트여야 합니다. 전역 상태는 React Context, 서버 상태는 React Query, 기능별 상태는 Custom Hook으로 관리합니다.

### Backend Architecture (Clean Architecture + Feature-Based)
백엔드는 Clean Architecture를 따르며, 기능(Feature)별로 폴더를 구성합니다. 각 Feature 내에서 Controller, Application, Domain, Repository, Routes 레이어가 단방향 의존성을 유지합니다. Repository는 DB 접근 및 TypeORM Entity를 반환하며, Service에서 비즈니스 로직 처리 및 DTO로 변환합니다. Mock/Real 스위칭을 지원하는 Generic Factory + Map 캐싱 패턴을 사용합니다.

### UI/UX Patterns
CSS 변수를 활용한 일관된 테마 적용, 전역 토스트 알림, 공통 Input/PasswordInput 컴포넌트, 반응형 디자인, 스켈레톤 로딩 등을 통해 사용자 경험을 개선합니다. 완료 화면은 `CompletionScreen` 공용 컴포넌트를 사용합니다.

### Core Features
- **홈 화면**: Feature-first 레이아웃, 자체 AppBar/BottomNav, Swiper.js 기반 HeroBanner.
- **상품 상세**: "상품정보", "후기 N", "문의" 탭 네비게이션. ReviewService 주입을 통한 리뷰 통계 제공.
- **2단계 상품 옵션**: MainOption(기본 가격)과 SubOption(추가 금액)으로 구성. lowestPrice 자동 계산. OptionBottomSheet로 선택. 레거시 상품 지원.
- **카테고리 페이지**: 바텀 네비게이션에서 접근. CategoryAppBar, CategoryList를 포함하며, 카테고리 클릭 시 해당 탭으로 이동.
- **브랜드 상품 페이지**: `/brand/:brandId` 라우트. 4개 브랜드(바담은, 오바다, 포시즌, 봉쿡) 탭 네비게이션. 브랜드 ID를 exposure category 태그명으로 매핑(badameun → "바담은 제품" 등).
- **프로필/마이페이지**: ProfileAppBar, ProfileHeader, SummaryCard, RecentOrders, MenuList로 구성.
- **소셜 로그인**: 카카오, 네이버 지원. `users` (기본), `user_social_accounts` (연동) 듀얼 테이블 구조. 이메일 필수 정책.
- **장바구니/주문**: `carts`, `cart_items`, `orders`, `order_items`, `order_status_history` 테이블로 관리. 주문 시 상품 가격/옵션 스냅샷 저장.
- **배송**: `shipping_addresses`, `shipments`, `shipment_events` 테이블.
- **결제**: `payments`, `payment_refunds` 테이블. NicePayments v1 API 연동. 장바구니 항목 ID 스냅샷(`cartItemIdsSnapshot`)을 통해 결제 완료 후 선택된 항목만 삭제.
- **쿠폰/포인트**: `coupons`, `coupon_issuances`, `point_wallets`, `point_transactions` 테이블. 포인트 만료 관리.
- **찜**: `wishlists`, `wishlist_items` 테이블.
- **고객센터**: `support_tickets`, `support_messages` 테이블.
- **비회원 결제**: 비회원도 장바구니/찜/결제 가능. localStorage에 버전 관리 스키마로 저장. 로그인 시 서버로 자동 병합.

### Guest Checkout System
비회원 결제 시스템 구현:
- **저장소**: `guestStorage.ts` - 버전 관리 스키마(v1)로 localStorage에 장바구니/찜 저장
- **병합**: `guestDataMerge.ts` - 로그인/회원가입 시 localStorage 데이터를 서버로 자동 병합
- **DB 테이블**: `guest_order_details` - 비회원 주문 상세 정보 (이름, 해시된 전화번호, 마지막 4자리, 이메일)
- **보안**: 휴대폰 번호는 SHA-256 해시로 저장, 마지막 4자리만 표시용으로 별도 저장
- **주문 조회**: 이름 + 휴대폰 번호로 비회원 주문 조회 가능
- **API 엔드포인트**:
  - `POST /api/payment/prepare-guest` - 비회원 결제 준비
  - `POST /api/payment/guest/lookup` - 비회원 주문 조회
  - `GET /api/payment/guest/order/:orderId` - 비회원 주문 상세
  - `POST /api/cart/merge` - 장바구니 병합 (수량 1~99 제한)
  - `POST /api/wishlist/merge` - 찜 목록 병합

### Database Schema Principles
주문 시점의 가격/옵션 스냅샷 저장, 상태 변경 이력 관리 (`order_status_history`, `shipment_events`), 포인트 만료 관리 (`point_transactions.expiresAt`), Soft Delete를 위한 `isActive` 플래그 사용.

## Object Storage (App Storage)
프로젝트는 `@replit/object-storage` SDK를 사용하여 파일 저장을 관리합니다.

### 특징
- **자동 인증**: Replit 환경에서 자동으로 인증 처리
- **환경 변수 불필요**: 버킷 설정을 위한 환경 변수가 필요 없음
- **포크 후 자동 작동**: 프로젝트를 포크해도 별도 설정 없이 바로 작동

### 파일 구조
- `apps/backend/objectStorage.ts` - 스토리지 서비스 클래스
- `apps/backend/objectAcl.ts` - 접근 권한(ACL) 관리
- `apps/backend/common/utils/imageUrl.ts` - 이미지 URL 변환 유틸리티

### 이미지 URL 변환
Object Storage의 상대 경로(`/objects/...`)를 배포 환경에서도 작동하도록 절대 URL로 변환합니다:
- 개발 환경: `REPLIT_DEV_DOMAIN` 환경 변수 사용
- Capacitor APK: 절대 URL로 백엔드 이미지에 접근
- 적용 위치: ProductService, HomeDataService, ReviewService, CartRoutes, WishlistRoutes 등

### 사용 예시
```typescript
import { ObjectStorageService } from './objectStorage';

const storageService = new ObjectStorageService();

// 파일 업로드
const objectPath = await storageService.uploadFile(buffer, 'filename.jpg', 'uploads');

// 파일 다운로드
await storageService.downloadObjectByPath(objectPath, res);
```

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
- **NicePayments v1**: PG 결제 연동