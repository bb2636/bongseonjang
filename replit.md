# 프로젝트명 - Replit.md

## Overview
[프로젝트 설명을 여기에 작성]

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
프론트엔드는 Hook-First 패턴을 따르며, 각 레이어의 역할이 명확히 구분됨:
- **Context**: 전역 상태 관리 (인증, 토스트, 모달 등)
- **Api**: 외부 API 호출 (카카오, 네이버 등)
- **Service**: 내부 백엔드 API 호출
- **Hook**: 페이지별 상태와 핸들러 캡슐화, namespace 객체 반환
- **Page**: Hook 호출 후 View에 namespace props 전달
- **View**: 받은 namespace props로 UI 렌더링

### Frontend Folder Structure
```
src/
├── features/              # 기능별 모듈
│   └── <feature>/
│       ├── views/         # UI 컴포넌트
│       ├── components/    # 기능 전용 컴포넌트
│       ├── hooks/         # 기능 전용 훅
│       ├── pages/         # 페이지 컴포넌트
│       └── constants/     # 상수
├── components/            # 공통 컴포넌트
├── contexts/              # React Context
├── hooks/                 # 공통 훅
├── layouts/               # 레이아웃
├── services/              # API 서비스
├── api/                   # 외부 API
├── assets/                # 이미지, 폰트 등
├── styles/                # 전역 스타일
├── App.tsx                # 루트 라우터
└── index.tsx              # 엔트리 포인트
```

### State Management
- **전역 상태**: React Context 사용 (AuthContext, ToastContext 등)
- **서버 상태**: React Query 사용
  - 5분 staleTime으로 캐싱
  - keepPreviousData로 페이지네이션 시 UI 깜빡임 방지
  - Query Key에 사용자 ID 포함하여 캐시 누수 방지
- **기능별 상태**: Custom Hook으로 캡슐화
- **멀티 스텝 폼**: Context Provider + Step별 Hook 분리

### Multi-Step Form Hook Pattern (회원가입 예시)
```
features/signup/hooks/
├── useSignupFormState.tsx    # Context/Provider - 공유 상태 + sessionStorage
├── useSignupEmailStep.ts     # Step 1: 이메일 인증 로직
├── useSignupPasswordStep.ts  # Step 2: 비밀번호 설정 로직
├── useSignupProfileStep.ts   # Step 3: 프로필/약관 로직
└── useSignupPage.ts          # 통합 Hook - currentStep 결정
```

**사용 패턴:**
```typescript
// Page에서 Provider로 감싸기
function SignupEmailPage() {
  return (
    <SignupFormProvider>
      <SignupEmailPageContent />
    </SignupFormProvider>
  );
}

// Content에서 통합 Hook 사용
function SignupEmailPageContent() {
  const { currentStep, emailStep, passwordStep, profileStep, onBack } = useSignupPage();
  return <SignupEmailView {...} />;
}
```

### React Query 패턴
```typescript
// 조회 Hook 예시
export function useDataList(userId: string) {
  return useQuery({
    queryKey: ['dataList', userId],
    queryFn: () => fetchDataList(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

// 뮤테이션 Hook 예시
export function useCreateData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataList'] });
    },
  });
}
```

### Backend Architecture (Clean Architecture with TypeORM)
백엔드는 Clean Architecture를 따르며, 레이어 간 단방향 의존성 유지:
- **Routes**: 라우팅 정의, Controller만 호출
- **Middleware**: 인증, 검증 등 공통 처리
- **Controller**: 요청/응답 처리, Application Service 호출
- **Application Service**: 비즈니스 로직 조합
- **Domain Service**: 핵심 비즈니스 규칙
- **Repository**: 데이터 접근 추상화
- **Entity**: TypeORM 엔티티 정의

### Backend Folder Structure
```
server/
├── routes/              # 라우트 정의
├── middleware/          # 미들웨어
├── controller/          # 컨트롤러
├── application/         # 애플리케이션 서비스
├── domain/              # 도메인 서비스
├── repository/          # 리포지토리
├── entity/              # TypeORM 엔티티
├── config/              # 설정 (database, etc.)
├── scheduler/           # 스케줄러 (cron jobs)
└── index.ts             # 서버 엔트리
```

## UI/UX Patterns
- CSS 변수를 통한 일관된 테마
- 전역 토스트 알림 시스템
- ValidatedInput 컴포넌트로 실시간 폼 검증
- 공통 컴포넌트를 통한 반응형 디자인
- 스켈레톤 로딩으로 UX 개선

## External Dependencies
- **React 18**: 프론트엔드 라이브러리
- **Vite**: 빌드 도구
- **styled-components**: CSS-in-JS
- **React Query**: 서버 상태 관리
- **Express.js**: 백엔드 프레임워크
- **TypeORM**: ORM
- **PostgreSQL**: 데이터베이스
- **bcrypt**: 비밀번호 해싱
- **jsonwebtoken**: JWT 토큰
