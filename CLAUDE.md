# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드다.

## 프로젝트: 일일 단편 소설 연재 게시판

매일 AI로 단편소설 1편 + 썸네일을 자동 생성해 DB에 저장하고, 웹에서 열람하는 서비스.

### MVP 스코프

**한다**
- 매일 1편 생성 (6~9월 공포 / 나머지 로맨스, 하드코딩 분기)
- 리스트/상세 페이지, 조회수

**안 한다** (금지 규칙 — 지금 규모에 안 맞는 조기 추상화 금지)
- 유저 인증, 댓글, 좋아요
- `genres` 테이블 등 장르 무한 확장 구조, 전략 패턴 — 장르는 지금 `Genre` 유니언 타입으로 충분. 장르가 3개 이상으로 늘어날 때만 DB 테이블화 검토

## 구조

pnpm workspaces 기반 모노레포 (`pnpm-workspace.yaml`: `apps/*`, `packages/*`).

| 앱/패키지 | 경로 | 스택 |
|---|---|---|
| 프론트엔드 | `apps/web` | Vite + React 19 + TanStack Query + Zustand + TailwindCSS v4 |
| 백엔드 | `apps/api` | NestJS |
| 공용 타입 | `packages/shared` | `Post`, `Genre` 등 프론트/백엔드 공용 타입. `pnpm install` 시 `prepare` 스크립트가 자동으로 `dist/`에 컴파일 (main/types가 dist를 가리킴) — 타입 수정 후에는 `pnpm --filter shared build`로 재빌드 |

### 외부 연동 (예정)

- DB/Storage: Supabase (Postgres + Storage). 스키마는 `supabase/schema.sql`에서 관리 — `apps/api/src/posts/entities/*.entity.ts`와 1:1로 맞춰야 하며, 엔티티를 바꾸면 이 파일도 같이 갱신한다.
- 텍스트/이미지 생성: Gemini API
- 크론 트리거: GitHub Actions scheduled workflow
- 배포: Render(`apps/api`), Vercel(`apps/web`)

## 명령어

```bash
pnpm install                    # 전체 워크스페이스 의존성 설치 (루트에서 실행)

pnpm --filter web dev           # 프론트엔드 개발 서버
pnpm --filter web build         # tsc -b && vite build
pnpm --filter web lint          # eslint

pnpm --filter api start:dev     # 백엔드 개발 서버 (watch)
pnpm --filter api build         # nest build
pnpm --filter api lint          # eslint --fix

pnpm --filter shared build      # 공용 타입 컴파일
pnpm --filter shared lint       # eslint
```

## 아키텍처

### apps/web

진입점: `src/main.tsx` (`QueryClientProvider` 마운트) → `src/App.tsx` (라우트 정의).

| 레이어 | 경로 | 역할 |
|---|---|---|
| Pages | `src/pages/` | 라우트 단위 화면 |
| Components | `src/components/` | 재사용 가능한 UI |
| Hooks | `src/hooks/` | API 훅: `use` + apiManager 메소드명 (예: `getTodo` → `useGetTodo`); 로직 훅: 성격별 접미사 (예: `useXxxForm`) |
| Stores | `src/stores/` | Zustand — 여러 페이지에서 공유되는 상태에만 사용 |
| API client | `src/libs/apis/restClient.ts` | Axios 인스턴스, 항상 `{ status, data }` 반환 |
| API methods | `src/libs/apis/apiManager.ts` | `restClient`를 호출하는 도메인 함수. 공용 타입은 `packages/shared`(예: `Post`)로 직접 지정, 이 앱만의 일회성 응답 타입만 `ApiResponse.*`(`src/libs/types/api-response.d.ts`)에 선언 |
| Types | `src/libs/types/` | 전역 타입 선언 (도메인 공용 타입인 `Post`/`Genre`는 `packages/shared`를 사용) |
| Utils | `src/libs/utils/` | `cn()` (clsx + tailwind-merge), `storageUtils` |

데이터 흐름: `Page/Component → useXxx 훅 → apiManager.getXxx() → restClient.get<ApiResponse.Xxx>()`

경로 별칭 `@`는 `src/`로 해석된다 (`vite.config.ts`, `tsconfig.json` 양쪽에 설정).

### apps/api

`nest new`로 생성한 기본 NestJS 스캐폴드. 새 리소스는 `nest g module/controller/service <name>` 또는 `server-scaffolder` 에이전트로 확장한다.

리소스 모듈은 `src/posts/`처럼 **전부 복수형**으로 만든다 — 폴더/모듈/컨트롤러/서비스/엔티티/라우트 모두 (`PostsModule`, `PostsController`, `PostsService`, `PostsEntity`, 라우트 `/posts`). 관심사별 하위 폴더(필요한 것만 생성): `entities/`, `dto/`, `constants/`, `decorators/`, `interceptors/`, `middleware/`, `filters/`(exception filter). 상세 파일명 패턴은 `server-scaffolder` 에이전트 참조.

## 컨벤션

- ESLint/Prettier는 루트 하나(`eslint.config.mjs`, `.prettierrc`)로 `apps/web`, `apps/api`, `packages/shared` 전체를 커버한다 — 앱별 설정 파일 없음. 루트 config 안에서 `files` 글롭으로 앱별 규칙(web=브라우저 globals+React 플러그인, api=Node globals+타입체크)을 분기한다. 새 workspace를 추가하면 이 파일에 블록을 하나 더 추가한다.
- 루트 `.gitignore`가 모든 워크스페이스의 `node_modules`, `dist`, `.env*`를 커버한다 — 앱별 `.gitignore`는 불필요.
- 프론트/백엔드가 공유하는 도메인 타입(`Post`, `Genre`)은 `packages/shared`에서 관리한다 — 각 앱에 중복 정의하지 않는다.
- 장르 분기 로직은 지금은 하드코딩 유지. 장르가 3개 이상으로 늘어나기 전까지 테이블화/전략 패턴 등으로 미리 확장하지 않는다.
