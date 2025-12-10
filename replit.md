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
`src/` 아래에 `features/` (기능별 모듈), `components/` (공통), `contexts/`, `hooks/`, `layouts/`, `services/`, `api/`, `assets/`, `styles/` 등의 폴더를 가집니다. 기능 전용 서비스는 `features/<feature>/services/`에, 공통 유틸리티는 `src/services/`에 위치합니다.

### State Management
- **전역 상태**: React Context 사용 (AuthContext, ToastContext 등).
- **서버 상태**: React Query 사용 (5분 staleTime 캐싱, `keepPreviousData`, Query Key에 사용자 ID 포함).
- **기능별 상태**: Custom Hook으로 캡슐화.
- **멀티 스텝 폼**: Context Provider와 Step별 Hook 분리 패턴을 사용합니다.

### React Query 패턴
`useQuery`는 데이터 조회에 사용되며, `queryKey`, `queryFn`, `staleTime`, `enabled` 옵션을 가집니다.
`useMutation`은 데이터 변경에 사용되며, `mutationFn`, `onSuccess`, `onError` 콜백을 통해 비동기 작업을 처리합니다. 로딩 상태는 `mutation.isPending`을 사용하며, 모든 API 호출은 `useMutation`으로 관리합니다.

### Backend Architecture (Clean Architecture + Feature-Based)
백엔드는 Clean Architecture를 따르며, 기능(Feature)별로 폴더를 구성합니다. 각 Feature 내에서 Controller, Application, Domain, Repository, Routes 레이어가 단방향 의존성을 유지합니다.

**백엔드 폴더 구조:**
```
server/
├── features/                    # 기능별 모듈
│   ├── auth/                    # 인증 + 사용자
│   │   ├── controller/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── repository/
│   │   ├── routes/
│   │   └── index.ts
│   ├── emailVerification/       # 이메일 인증
│   │   ├── controller/
│   │   ├── application/
│   │   ├── repository/
│   │   ├── routes/
│   │   └── index.ts
│   ├── referral/                # 추천인
│   │   ├── controller/
│   │   ├── application/
│   │   ├── repository/
│   │   ├── routes/
│   │   └── index.ts
│   └── home/                    # 홈 화면
│       ├── controller/
│       ├── application/
│       ├── domain/
│       ├── repository/
│       ├── routes/
│       └── index.ts
├── common/                      # 공통 모듈
│   ├── middleware/              # authMiddleware 등
│   └── services/                # emailService 등
├── config/                      # 설정 (database, repositories)
├── entity/                      # TypeORM 엔티티
├── routes/                      # 라우트 집계 (features에서 import)
└── index.ts                     # 서버 엔트리
```

### Repository Pattern (Clean Architecture)
**중요**: Repository는 TypeORM Entity를 반환하고, Service에서 DTO로 변환합니다.

**레이어 책임:**
- **Repository**: DB 접근, Entity 반환
- **Service**: 비즈니스 로직, Entity → DTO 변환
- **Controller**: HTTP 요청/응답 처리

**예시 (Product feature):**
```typescript
// Repository - Entity 반환
interface ProductRepository {
  findById(id: string): Promise<Product | null>;
}

// Service - DTO 변환 + 비즈니스 로직
class ProductService {
  async getProductById(id: string): Promise<ProductDetailDto | null> {
    const product = await this.productRepository.findById(id);
    if (!product) return null;
    return this.toDetailDto(product);
  }
}
```

### Repository Pattern (Mock/Real 스위칭)
목 데이터와 실제 DB 구현체를 쉽게 전환할 수 있는 Generic Factory + Map 캐싱 패턴:

**파일 구조:**
```
server/features/<feature>/repository/
├── <Feature>Repository.ts        # 인터페이스 정의
├── Mock<Feature>Repository.ts    # 목 구현체 (개발용)
└── TypeORM<Feature>Repository.ts # 실제 구현체 (프로덕션용)

server/config/
└── repositories.ts               # 구현체 선택 설정
```

**핵심 구조:**
```typescript
export const REPOSITORY_TYPE = { MOCK: 'mock', REAL: 'real' } as const;

const config: RepositoryConfig = { referral: REPOSITORY_TYPE.MOCK };

const repositoryMap: RepositoryMap = {
  referral: {
    [REPOSITORY_TYPE.MOCK]: () => new MockReferralRepository(),
    [REPOSITORY_TYPE.REAL]: () => new TypeORMReferralRepository(),
  },
};

const instances = new Map<keyof RepositoryConfig, unknown>();

function createRepository<T>(name: keyof RepositoryConfig): T {
  const cached = instances.get(name);
  if (cached) return cached as T;
  const instance = repositoryMap[name][config[name]]();
  instances.set(name, instance);
  return instance as T;
}

export const repositories = {
  get referral() { return createRepository<ReferralRepository>('referral'); },
};
```

**새 Repository 추가 (2곳만 수정):**
1. `repository/` 폴더에 인터페이스 + Mock/TypeORM 구현체 생성
2. `config/repositories.ts`에서:
   - `RepositoryConfig` + `RepositoryMap` 인터페이스에 항목 추가
   - `config` + `repositoryMap` 객체에 값 추가
   - `repositories` 객체에 getter 추가

**Mock/Real 전환:** `config` 객체에서 `REPOSITORY_TYPE.MOCK` ↔ `REPOSITORY_TYPE.REAL` 변경

## UI/UX Patterns
- **CSS 변수**: 일관된 테마 적용.
- **전역 토스트 알림 시스템**.
- **공통 Input/PasswordInput 컴포넌트**: 일관된 폼 스타일링. `src/components/`에 위치하며, 라벨, 입력 필드, 에러 메시지를 통합 제공합니다.
- **반응형 디자인**: 공통 컴포넌트를 활용.
- **스켈레톤 로딩**: UX 개선.

### CompletionScreen 공용 컴포넌트
완료 화면(회원가입 완료, 비밀번호 변경 완료 등)에서 재사용하는 공용 컴포넌트입니다.

**위치**: `src/components/CompletionScreen/`

**구조**:
```
├── CompletionScreen.tsx   # 메인 컴포넌트
├── CompletionScreen.css   # 스타일
├── constants.ts           # variant별 멘트 정의
└── index.ts               # export
```

**사용법**:
```tsx
import { CompletionScreen, COMPLETION_VARIANT } from '@/components/CompletionScreen';

<CompletionScreen
  variant={COMPLETION_VARIANT.SIGNUP_COMPLETE}
  onButtonClick={handleClick}
/>
```

**새 variant 추가**: `constants.ts`의 `COMPLETION_VARIANT`와 `COMPLETION_CONTENT`에 항목 추가

**Props 직접 전달**: 특수한 경우 `title`, `subtitle`, `buttonText` props로 직접 전달 가능

### Home Feature (홈 화면)
홈 화면은 feature-first 레이아웃 전략을 사용하며, MainLayout을 사용하지 않고 자체 AppBar/BottomNav를 가집니다.

**홈 화면 컴포넌트:**
```
src/features/home/
├── components/
│   ├── HomeAppBar/           # 상단 앱바 (봉선장 로고 + 장바구니)
│   ├── HomeBottomNav/        # 하단 네비게이션 (홈, 카테고리, 검색, 봉크루)
│   └── HeroBanner/           # 히어로 배너 (Swiper.js 자동 슬라이드)
├── hooks/
│   ├── useHomePage.ts        # 홈 페이지 로직
│   └── useHeroImages.ts      # 히어로 이미지 React Query hook
├── api/
│   └── heroImageApi.ts       # API 호출
├── types/
│   └── heroImage.ts          # HeroImage 타입 정의
├── views/
│   └── HomeView.tsx          # 홈 화면 View
└── pages/
    └── HomePage.tsx          # 홈 페이지 (Hook 호출 + View 렌더링)
```

**HeroBanner (Swiper.js):**
- 자동 재생 (3초 간격)
- 무한 루프
- 페이지네이션 dots
- 높이: 247px

**Home API:**
- `GET /api/home/hero-images`: 히어로 배너 이미지 목록
- Mock/Real Repository 스위칭 지원

### Review Feature (리뷰 시스템)
상품에 대한 리뷰 및 평점 관리 기능입니다.

**Entity 구조 (reviews 테이블):**
```
reviews
├── id (UUID, PK)
├── productId (UUID, FK → products.id)
├── userId (UUID, FK → users.id)
├── rating (INTEGER, 1~5)
├── content (TEXT)
├── imageUrls (TEXT[], 선택)
├── isVerifiedPurchase (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

**API 엔드포인트:**
- `GET /api/reviews/product/:productId` - 상품 리뷰 목록
- `GET /api/reviews/product/:productId/stats` - 상품 리뷰 통계 (평균 평점, 분포)
- `POST /api/reviews` - 리뷰 작성 (인증 필요)
- `DELETE /api/reviews/:id` - 리뷰 삭제 (인증 필요)

**Service 간 의존성 (ReviewStatsProvider):**
ProductService가 리뷰 통계를 가져오기 위해 ReviewService를 주입받습니다.
```typescript
interface ReviewStatsProvider {
  getReviewStatsByProductId(productId: string): Promise<ReviewStats>;
}

class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private reviewStatsProvider?: ReviewStatsProvider,
  ) {}
}
```

## External Dependencies
- **React 18**: 프론트엔드 라이브러리
- **Vite**: 빌드 도구
- **Vanilla CSS**: 스타일링 (CSS 변수 활용)
- **React Query**: 서버 상태 관리
- **Swiper.js**: 이미지 슬라이더/캐러셀
- **Express.js**: 백엔드 프레임워크
- **TypeORM**: ORM
- **PostgreSQL**: 데이터베이스
- **bcrypt**: 비밀번호 해싱
- **jsonwebtoken**: JWT 토큰