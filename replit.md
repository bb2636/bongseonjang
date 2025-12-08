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

### Backend Architecture (Clean Architecture with TypeORM)
백엔드는 Clean Architecture를 따르며, Routes, Middleware, Controller, Application Service, Domain Service, Repository, Entity 레이어로 구성됩니다. 각 레이어는 단방향 의존성을 유지합니다.

**백엔드 폴더 구조:**
`server/` 아래에 `routes/`, `middleware/`, `controller/`, `application/`, `domain/`, `repository/`, `entity/`, `config/`, `scheduler/` 등의 폴더를 가집니다.

### Repository Pattern (Mock/Real 스위칭)
Repository 패턴을 통해 목 데이터와 실제 DB 구현체를 쉽게 전환할 수 있습니다. `repository/` 폴더에 인터페이스와 Mock/TypeORM 구현체를 정의하고, `config/repositories.ts`에서 사용할 구현체를 설정합니다. ApplicationService는 Repository 인터페이스를 통해 데이터에 접근합니다.

## UI/UX Patterns
- **CSS 변수**: 일관된 테마 적용.
- **전역 토스트 알림 시스템**.
- **공통 Input/PasswordInput 컴포넌트**: 일관된 폼 스타일링. `src/components/`에 위치하며, 라벨, 입력 필드, 에러 메시지를 통합 제공합니다.
- **반응형 디자인**: 공통 컴포넌트를 활용.
- **스켈레톤 로딩**: UX 개선.

## External Dependencies
- **React 18**: 프론트엔드 라이브러리
- **Vite**: 빌드 도구
- **Vanilla CSS**: 스타일링 (CSS 변수 활용)
- **React Query**: 서버 상태 관리
- **Express.js**: 백엔드 프레임워크
- **TypeORM**: ORM
- **PostgreSQL**: 데이터베이스
- **bcrypt**: 비밀번호 해싱
- **jsonwebtoken**: JWT 토큰