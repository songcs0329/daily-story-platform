# daily-story-platform

매일 AI로 단편소설 1편 + 썸네일을 자동 생성해 열람하는 서비스. pnpm workspaces 기반 모노레포.

## Structure

```
apps/
├── web/     # Vite + React 19 + TanStack Query + Zustand + TailwindCSS v4
└── api/     # NestJS
packages/
└── shared/  # Post, Genre 등 프론트/백엔드 공용 타입
```

## Requirements

- Node.js >= 22
- pnpm >= 11

## Setup

```bash
pnpm install
```

## Scripts

| Command | Description |
|---|---|
| `pnpm --filter web dev` | 프론트엔드 개발 서버 (http://localhost:5173) |
| `pnpm --filter web build` | 프론트엔드 프로덕션 빌드 |
| `pnpm --filter web lint` | 프론트엔드 eslint |
| `pnpm --filter api start:dev` | 백엔드 개발 서버, watch 모드 (http://localhost:3000) |
| `pnpm --filter api build` | 백엔드 빌드 |
| `pnpm --filter api lint` | 백엔드 eslint --fix |
| `pnpm --filter shared build` | 공용 타입 컴파일 |

각 앱의 상세 구조/컨벤션은 [CLAUDE.md](./CLAUDE.md)를 참고한다.
