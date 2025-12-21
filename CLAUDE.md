# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

봉크루 (Bongkru) - Korean e-commerce web application built as a pnpm monorepo with React frontend, Express backend, and shared TypeScript types.

## Commands

```bash
# Development
pnpm dev                    # Run frontend + backend concurrently
pnpm dev:frontend           # Frontend only (port 5000)
pnpm dev:backend            # Backend only (port 3001)

# Build
pnpm build                  # Build contract + frontend
pnpm build:contract         # Build shared types package
pnpm build:frontend         # Vite production build

# Individual packages
pnpm --filter @bongkru/frontend dev
pnpm --filter @bongkru/backend dev
pnpm --filter @bongkru/contract build
```

## Architecture

### Monorepo Structure
- `apps/frontend/` - React + Vite (`@bongkru/frontend`)
- `apps/backend/` - Express + TypeORM (`@bongkru/backend`)
- `packages/contract/` - Shared TypeScript types (`@bongkru/contract`)

### Frontend Architecture (Hook-First Pattern)
- **Page** → calls Hook → passes props to **View**
- View is pure presentation (no logic, no CSS imports in Page files)
- State: React Context (global), React Query (server), Custom Hooks (feature)
- Features in `src/features/` with hooks/, views/, services/, types/ subdirectories

### Backend Architecture (Clean Architecture + Feature-Based)
- Each feature folder contains: Controller, Service, Repository, Routes
- Repository returns TypeORM entities; Service converts to DTOs
- 56+ TypeORM entities in `entity/` folder
- Features in `features/` folder (auth, user, product, order, payment, etc.)

### Shared Types
```typescript
import { LoginRequest, ProductDto, OrderStatus } from '@bongkru/contract';
```

## Code Style Requirements

### Styling
- **Vanilla CSS only** - No CSS-in-JS (styled-components, emotion, tailwind)
- CSS variables for theming (colors, spacing, typography)
- Component-specific CSS files: `Component.tsx` + `Component.css`
- BEM naming or feature-based class naming

### Naming Conventions
- Use exact singular/plural forms
- Descriptive names, no abbreviations
- Globally understandable terms

### Code Principles
- Early return pattern
- Magic numbers as constants
- One method = one responsibility
- Return types must be explicit
- Order: public → protected → private
- Prefer composition over inheritance
- Use Value Objects for related values
- Wrap collections in first-class collections

## Git Workflow

Git Flow branching: `main`, `develop`, `feature/*`, `hotfix/*`, `release/*`

Commit message format:
```
feat: brief title

Detailed description 1
Detailed description 2
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`

## Key Technical Details

### Database
- PostgreSQL with TypeORM
- Order snapshots stored at purchase time (prices, options)
- Status history tables (`order_status_history`, `shipment_events`)
- Soft delete via `isActive` flag

### External Services
- NicePayments v1 API for payments
- Kakao/Naver OAuth for social login
- Replit Object Storage for file uploads

### Important Patterns
- 2-level product options: MainOption (base price) + SubOption (additional)
- Dual table social auth: `users` + `user_social_accounts`
- Cart item ID snapshots for payment completion cleanup
