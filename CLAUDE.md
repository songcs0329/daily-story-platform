# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드다.

## 프로젝트: 일일 단편 소설 연재 게시판

매일 AI로 단편소설 여러 편 + 썸네일을 자동 생성해 DB에 저장하고, 웹에서 열람하는 서비스.

설계 근거와 기각한 대안은 [DESIGN.md](./DESIGN.md), 흐름도는 [FLOWCHART.md](./FLOWCHART.md), 테이블은 [apps/api/ERD.md](./apps/api/ERD.md).

### 현재 스코프

**있는 것**
- 매일 N편 생성 — 개수는 `daily-story-generator.gs`의 `DAILY_POST_COUNT`, 장르는 `genres` 테이블에서 랜덤 선택
- 리스트(무한스크롤)/상세 페이지, 조회수
- 카카오 로그인 → 자체 JWT (`apps/api/src/auth/`)
- 댓글 작성/삭제 (로그인 필수, 본인 것만 삭제)

**안 한다** (금지 규칙 — 지금 규모에 안 맞는 조기 추상화 금지)
- 좋아요, 검색, 장르 필터 — 하루 몇 편 규모에선 필터할 모수가 없다
- 리프레시 토큰 — 401이면 로그아웃시키는 것으로 충분
- 조회수 어뷰징 방지 (조회 로그 테이블), 댓글 페이지네이션 — 각각 수치가 의사결정에 쓰일 때 / 한 글의 댓글이 많아질 때

새 기능을 넣기 전 판단 기준: "언젠가 필요할까"가 아니라 **"지금 이걸 안 하면 무엇이 막히나"**.

## 구조

pnpm workspaces 기반 모노레포 (`pnpm-workspace.yaml`: `apps/*`, `packages/*`).

| 앱/패키지 | 경로 | 스택 |
|---|---|---|
| 프론트엔드 | `apps/web` | Vite + React 19 + TanStack Query + Zustand + TailwindCSS v4 |
| 백엔드 | `apps/api` | NestJS |
| 공용 타입 | `packages/shared` | `Post`, `User`, `Comment`, `Paginated<T>` 등 프론트/백엔드 공용 타입. `pnpm install` 시 `prepare` 스크립트가 자동으로 `dist/`에 컴파일 (main/types가 dist를 가리킴) — 타입 수정 후에는 `pnpm --filter shared build`로 재빌드 |

### 외부 연동

- DB/Storage: Supabase (Postgres + Storage). 테이블은 `posts`, `genres`, `users`, `comments` 4개. 스키마는 `supabase/schema.sql`에서 관리 — `apps/api/src/*/entities/*.entity.ts`와 1:1로 맞춰야 하며, 엔티티를 바꾸면 이 파일과 `apps/api/ERD.md`도 같이 갱신한다. `apps/api`는 PostgREST가 아니라 `DATABASE_URL`로 Postgres에 직접 접속하므로 RLS 적용 대상이 아니다 — 권한 판단은 전부 API 레이어에 있다.
- 텍스트/이미지 생성: Gemini API. 실제 운영 크론은 `scripts/apps-script/daily-story-generator.gs`(Google Apps Script)가 담당 — Gemini 호출부터 Supabase Storage 업로드, `posts` insert까지 전부 직접 처리하므로 apps/api가 떠 있을 필요 없음. 텍스트/이미지 모두 여러 모델 순서대로 시도하는 폴백 체인 사용 (모델별 무료 쿼터/장애에 대비). 실제 계정으로 end-to-end 검증 완료(생성→업로드→DB insert). `apps/api/src/generation/`(`POST /generation`, 헤더 `x-generation-secret`)은 수동/로컬 테스트 전용으로 남겨둠 — 실제 스케줄에는 안 붙음.
- Supabase 키: 이 프로젝트는 2025-11-01 이후 생성돼 레거시 JWT `service_role` 키를 씀 (새 `sb_secret_` 키는 Apps Script의 `UrlFetchApp`을 브라우저로 오인해 401 차단함 — `SUPABASE_USER_AGENT` 헤더로 우회 시도했지만 실패, 레거시 키로 해결). 레거시 키는 2026년 말 폐기 예정이라 그 전에 재대응 필요.
- 크론 트리거: Google Apps Script 자체 시간 기반 트리거 (스크립트는 `scripts/apps-script/`, 프로젝트 생성·트리거 등록은 script.google.com에서 수동 설정). `generateDailyPost`가 트리거 대상, `testGenerateDailyPost`는 오늘자 게시물 존재 여부와 무관하게 강제 실행하는 수동 테스트 전용 함수. **리포의 `.gs` 파일은 사본일 뿐 자동 동기화되지 않는다** — 수정 후 script.google.com에 직접 붙여넣어야 반영된다 (clasp 미연동).
- 생성 실패 알림: `.gs`의 중단 지점은 전부 `throw`한다. Apps Script가 트리거 예외에 대해 소유자에게 실패 메일을 자동 발송하므로 별도 알림 코드가 없다 — 조용한 `return`을 추가하면 실패가 묻히니 금지. 알림 주기는 트리거 목록 UI에서 설정(기본 '매일 요약').
- 배포: Render(`apps/api`, 루트 `render.yaml` 블루프린트로 설정 — 모노레포라 빌드는 리포 루트에서 `pnpm install && pnpm --filter api build`), Vercel(`apps/web`, 프로젝트 Root Directory를 `apps/web`로 설정). `apps/api`는 `app.enableCors()`로 모든 origin 허용 — 인증 없는 공개 조회 API라 오리진 제한 불필요.

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
| Stores | `src/stores/` | Zustand — 여러 페이지에서 공유되는 상태에만 사용. 현재 `useAuthStore`(persist) 하나뿐이며, 서버 데이터는 전부 TanStack Query가 맡는다 |
| API client | `src/libs/apis/restClient.ts` | Axios 인스턴스, 항상 `{ status, data }` 반환. 인터셉터 2개가 인증의 유일한 접점 — 요청에 JWT 부착, 401 응답 시 로그아웃 후 `/`로 이동. 컴포넌트에서 토큰을 직접 다루지 않는다 |
| API methods | `src/libs/apis/apiManager.ts` | `restClient`를 호출하는 도메인 함수. 공용 타입은 `packages/shared`(예: `Post`)로 직접 지정, 이 앱만의 일회성 응답 타입만 `ApiResponse.*`(`src/libs/types/api-response.d.ts`)에 선언 |
| Types | `src/libs/types/` | 전역 타입 선언 (도메인 공용 타입인 `Post`/`User`/`Comment`는 `packages/shared`를 사용) |
| Utils | `src/libs/utils/` | `cn()` (clsx + tailwind-merge), `storageUtils` |

데이터 흐름: `Page/Component → useXxx 훅 → apiManager.getXxx() → restClient.get<ApiResponse.Xxx>()`

경로 별칭 `@`는 `src/`로 해석된다 (`vite.config.ts`, `tsconfig.json` 양쪽에 설정).

### apps/api

`nest new`로 생성한 기본 NestJS 스캐폴드. 새 리소스는 `nest g module/controller/service <name>` 또는 `server-scaffolder` 에이전트로 확장한다.

모듈: `posts`, `comments`, `users`, `genres`(엔티티만), `auth`, `generation`(수동 테스트용). 인증은 `auth/auth.guard.ts`의 가드 2개로 끝낸다 — `AuthGuard`(실패 시 401, 댓글 쓰기/삭제)와 `OptionalAuthGuard`(토큰 있으면 주입, 없어도 통과, 글 상세). 게스트도 읽을 수 있어야 하므로 조회 API에 `AuthGuard`를 붙이지 않는다. 조회수는 로그인 사용자 요청에만 증가한다.

리소스 모듈은 `src/posts/`처럼 **전부 복수형**으로 만든다 — 폴더/모듈/컨트롤러/서비스/엔티티/라우트 모두 (`PostsModule`, `PostsController`, `PostsService`, `PostsEntity`, 라우트 `/posts`). 관심사별 하위 폴더(필요한 것만 생성): `entities/`, `dto/`, `constants/`, `decorators/`, `interceptors/`, `middleware/`, `filters/`(exception filter). 상세 파일명 패턴은 `server-scaffolder` 에이전트 참조.

컨트롤러/서비스 메소드명은 `findAll`/`findOne`처럼 내장 함수(Array.prototype, TypeORM Repository 등)와 헷갈리는 이름 대신 `getPosts`/`getPost`처럼 도메인이 드러나는 이름을 쓴다.

## 컨벤션

- ESLint/Prettier는 루트 하나(`eslint.config.mjs`, `.prettierrc`)로 `apps/web`, `apps/api`, `packages/shared` 전체를 커버한다 — 앱별 설정 파일 없음. 루트 config 안에서 `files` 글롭으로 앱별 규칙(web=브라우저 globals+React 플러그인, api=Node globals+타입체크)을 분기한다. 새 workspace를 추가하면 이 파일에 블록을 하나 더 추가한다.
- 루트 `.gitignore`가 모든 워크스페이스의 `node_modules`, `dist`, `.env*`를 커버한다 — 앱별 `.gitignore`는 불필요.
- 프론트/백엔드가 공유하는 도메인 타입(`Post`, `User`, `Comment`, `Paginated`)은 `packages/shared`에서 관리한다 — 각 앱에 중복 정의하지 않는다.
- 장르는 `genres` 테이블이 단일 출처다. `slug`(PK) / `label` / `story_prompt`를 갖고 `posts.genre`가 FK로 참조하며, 생성 스크립트가 여기서 랜덤으로 고른다. 프롬프트를 배포 없이 고치려고 DB에 둔 것이므로 프롬프트 문구를 코드로 되돌리지 않는다. `posts.genre`도 enum이 아니라 `text` + FK — 장르 추가가 마이그레이션이 아니라 `insert` 한 줄이어야 한다.
- 의도적으로 단순하게 둔 자리에는 `ponytail:` 주석으로 한계와 승격 조건을 남긴다.
