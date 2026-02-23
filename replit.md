# 봉크루 (Bongkru)

## Overview
본 프로젝트는 사용자 친화적인 이커머스 웹 애플리케이션 구축을 목표로 합니다. 효율적인 사용자 인증 및 계정 관리 시스템을 포함하며, 확장 가능하고 유지보수하기 쉬운 아키텍처를 통해 견고한 서비스를 제공합니다. 주요 목표는 고객에게 원활한 쇼핑 경험을 제공하고, 다양한 제품과 서비스를 효과적으로 제공할 수 있는 안정적인 플랫폼을 구축하는 것입니다.

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
- 구현 전 반드시 계획을 제안하고 사용자 승인을 받을 것
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
- Replit Agent는 코드 변경 시 자동으로 커밋을 생성함 (비활성화 불가)
- **워크플로우**:
  1. Agent가 코드 변경 완료
  2. Agent가 커밋 메시지 제안 및 "**커밋 메시지를 수정해주세요!**" 표시
  3. 사용자가 `git commit --amend`로 메시지 수정
  4. 사용자가 `git push` 실행
- **역할 분담**:
  - Agent: 코드 변경, 커밋 메시지 제안, 수정 알림
  - 사용자: 커밋 메시지 수정, push

## System Architecture

### Project Structure (Monorepo)
프로젝트는 `apps/` (frontend, backend), `packages/` (contract)로 구성된 모노레포 형태로 관리됩니다.

### Frontend Architecture (Hook-First Pattern)
프론트엔드는 React와 Vite를 사용하며, Hook-First 패턴을 따릅니다. Context, Api, Service, Hook, Page, View 레이어로 구성되며, Page는 Hook 호출 후 View에 props를 전달하고, View는 UI 렌더링만 담당합니다. 전역 상태는 React Context, 서버 상태는 React Query, 기능별 상태는 Custom Hook으로 관리합니다. 모든 프론트엔드 fetch 호출은 `API_BASE_URL`을 사용합니다. Capacitor 환경을 지원하며, 카메라 플러그인을 활용한 이미지 업로드 기능을 제공합니다.

### Backend Architecture (Clean Architecture + Feature-Based)
백엔드는 Express.js와 TypeORM을 사용하며, Clean Architecture를 따르고 기능(Feature)별로 폴더를 구성합니다. 각 Feature 내에서 Controller, Application, Domain, Repository, Routes 레이어가 단방향 의존성을 유지합니다. Repository는 DB 접근 및 TypeORM Entity를 반환하며, Service에서 비즈니스 로직 처리 및 DTO로 변환합니다. Mock/Real 스위칭을 지원하는 Generic Factory + Map 캐싱 패턴을 사용합니다.

### UI/UX Patterns
CSS 변수를 활용한 일관된 테마 적용, 전역 토스트 알림, 공통 Input/PasswordInput 컴포넌트, 반응형 디자인, 스켈레톤 로딩 등을 통해 사용자 경험을 개선합니다. 완료 화면은 `CompletionScreen` 공용 컴포넌트를 사용합니다.

### Authentication System (Separated Sessions)
관리자와 사용자 인증 세션이 완전히 분리되어 `user_token` 및 `admin_token`을 사용하여 관리됩니다.

### Core Features
-   **홈 화면**: Feature-first 레이아웃, Swiper.js 기반 HeroBanner.
-   **이벤트**: `banners` 테이블의 `HOME_EVENT` 포지션을 활용.
-   **상품 상세**: "상품정보", "후기 N", "문의" 탭 네비게이션, 2단계 상품 옵션 지원.
-   **카테고리/브랜드 상품 페이지**: 바텀 네비게이션 및 브랜드 ID 매핑을 통한 제품 분류.
-   **프로필/마이페이지**: 개인 정보 및 주문 내역 관리.
-   **소셜 로그인**: 카카오, 네이버, 구글, 애플을 지원하며, `users`와 `user_social_accounts` 듀얼 테이블 구조를 사용합니다. Apple OAuth의 경우 백엔드에서 `form_post` 처리 후 프론트엔드로 리다이렉트합니다.
-   **장바구니/주문/결제**: `carts`, `orders`, `payments` 등 관련 테이블로 관리하며, NicePayments v1 연동. 결제 완료 후 `cartItemIdsSnapshot`을 통해 선택된 항목만 삭제하고, JavaScript 기반 리다이렉트 또는 딥링크를 통해 결제 완료 페이지로 이동합니다.
-   **결제 트랜잭션 처리**: 결제 완료 시점에 재고 차감, 포인트 사용, 쿠폰 사용이 단일 트랜잭션으로 원자적 처리됩니다. 비관적 락(`pessimistic_write`)으로 동시성 제어하며, 실패 시 NicePay 결제 취소 API를 호출합니다. 주문 취소/환불 시 재고, 포인트, 쿠폰이 자동 복원되며, 멱등성 체크로 중복 처리를 방지합니다.
-   **쿠폰/포인트**: `coupons`, `point_wallets` 테이블로 관리하며, 브랜드 카테고리 쿠폰 및 복수 쿠폰 사용을 지원합니다.
-   **찜**: `wishlists` 테이블로 관리.
-   **고객센터**: `support_tickets` 테이블로 관리.
-   **비회원 결제**: localStorage에 장바구니/찜 데이터를 저장하고, 로그인 시 서버로 자동 병합됩니다. 비회원 주문 상세 정보는 `guest_order_details` 테이블에 저장되며, 전화번호는 해시 처리됩니다.
-   **관리자 리뷰 관리**: 리뷰 목록 조회 (검색, 별점 필터), 상세 보기 (이미지 포함), 삭제 기능.
-   **관리자 카테고리 관리**: 노출 카테고리, 전시 카테고리, 상품 카테고리 3종의 CRUD 관리 (탭 UI).
-   **관리자 설정**: 서버 캐시 관리 (홈/리뷰 캐시 상태 조회 및 초기화), 시스템 정보 표시.

### Database Schema Principles
주문 시점의 가격/옵션 스냅샷 저장, 상태 변경 이력 관리 (`order_status_history`, `shipment_events`), 포인트 만료 관리 (`point_transactions.expiresAt`), Soft Delete를 위한 `isActive` 플래그 사용.

### Object Storage (App Storage)
프로젝트는 `@replit/object-storage` SDK를 사용하여 파일 저장을 관리합니다. Replit 환경에서 자동 인증되며, `objectStorage.ts`, `objectAcl.ts`, `imageUrl.ts` 파일에서 관련 로직을 처리합니다. 이미지 URL은 배포 환경에서 작동하도록 절대 URL로 변환됩니다.

## External Dependencies
-   **React 18**: 프론트엔드 라이브러리
-   **Vite**: 빌드 도구
-   **Vanilla CSS**: 스타일링
-   **React Query**: 서버 상태 관리
-   **Swiper.js**: 이미지 슬라이더/캐러셀
-   **Express.js**: 백엔드 프레임워크
-   **TypeORM**: ORM
-   **PostgreSQL**: 데이터베이스
-   **bcrypt**: 비밀번호 해싱
-   **jsonwebtoken**: JWT 토큰
-   **NicePayments v1**: PG 결제 연동