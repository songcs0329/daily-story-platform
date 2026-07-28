# 플로우차트

DB 구조는 [apps/api/ERD.md](./apps/api/ERD.md) 참고.

## 프론트엔드 (apps/web)

```mermaid
flowchart TD
    main["main.tsx<br/>QueryClientProvider"] --> App["App.tsx<br/>BrowserRouter"]

    App --> Login["/ · Login"]
    App --> Posts["/posts · Posts"]
    App --> Detail["/posts/:postId · PostDetail"]
    App --> NotFound["* · NotFound"]

    Login -->|카카오로 로그인| Kakao["Kakao JS SDK<br/>Auth.login()"]
    Kakao -->|kakaoAccessToken| Mgr
    Login -->|로그인 없이 둘러보기| Posts

    Posts --> UGP["useGetPosts<br/>useInfiniteQuery ['posts']"]
    Detail --> UGPost["useGetPost<br/>useQuery ['post', id]"]
    Detail --> UGC["useGetComments<br/>useQuery ['comments', postId]"]
    Detail --> UCC["useCreateComment<br/>useMutation"]
    Detail --> UDC["useDeleteComment<br/>useMutation"]

    UCC -.invalidate.-> UGC
    UDC -.invalidate.-> UGC

    UGP --> Mgr["apiManager"]
    UGPost --> Mgr
    UGC --> Mgr
    UCC --> Mgr
    UDC --> Mgr

    Mgr --> Rest["restClient (axios)<br/>{ status, data } 반환"]
    Rest -->|request interceptor| Store["useAuthStore (zustand + persist)<br/>accessToken → Authorization 헤더"]
    Rest --> API["apps/api"]

    Mgr -.로그인 응답.-> Store
```

핵심: 인증 상태는 `useAuthStore` 한 곳에만 있고, `restClient` 인터셉터가 매 요청에 JWT를 붙인다. 컴포넌트는 토큰을 직접 다루지 않는다. 비로그인도 목록/상세는 볼 수 있다.

## 백엔드 (apps/api)

```mermaid
flowchart TD
    Req["HTTP 요청"] --> Main["main.ts<br/>enableCors() · 전체 origin 허용"]
    Main --> AppMod["AppModule<br/>ConfigModule + TypeOrmModule"]

    AppMod --> AuthC["AuthController<br/>POST /auth/kakao/login"]
    AppMod --> PostsC["PostsController<br/>GET /posts · GET /posts/:id"]
    AppMod --> CommentsC["CommentsController<br/>GET/POST /posts/:postId/comments<br/>DELETE /comments/:commentId"]
    AppMod --> GenC["GenerationController<br/>POST /generation · 수동 테스트 전용"]

    PostsC -->|GET /posts/:id| OptGuard["OptionalAuthGuard<br/>토큰 있으면 user 주입, 없으면 통과"]
    CommentsC -->|POST/DELETE| Guard["AuthGuard<br/>JWT 검증 실패 시 401"]

    AuthC --> AuthS["AuthService"]
    AuthS -->|kakaoAccessToken 검증| KakaoAPI["kapi.kakao.com<br/>/v2/user/me"]
    AuthS --> UsersS["UsersService<br/>upsertByKakaoId"]
    AuthS -->|jwt.sign| Token["accessToken + user 반환"]

    OptGuard --> PostsS["PostsService<br/>getPosts (페이지네이션, max 50)<br/>getPost (로그인 시에만 조회수 +1)"]
    Guard --> CommentsS["CommentsService<br/>목록/작성/삭제<br/>본인 댓글만 삭제 가능"]
    CommentsS --> UsersS

    PostsS --> ORM["TypeORM Repository"]
    CommentsS --> ORM
    UsersS --> ORM
    ORM -->|DATABASE_URL 직접 접속, SSL| DB[("Supabase Postgres<br/>posts · genres · users · comments")]
```

핵심: 인증은 `AuthGuard` / `OptionalAuthGuard` 두 개로 끝. 조회수는 로그인 사용자 요청에만 증가한다. PostgREST가 아니라 `DATABASE_URL`로 직접 붙으므로 RLS 대상이 아니다.

## 프론트 ↔ 백엔드 호출 흐름

| 화면 / 동작 | 훅 | 엔드포인트 | 인증 |
|---|---|---|---|
| 로그인 | — (`apiManager.kakaoLogin`) | `POST /auth/kakao/login` | 불필요 (카카오 토큰 전달) |
| 목록 | `useGetPosts` | `GET /posts?page&limit` | 불필요 |
| 상세 | `useGetPost` | `GET /posts/:id` | 선택 — 있으면 조회수 +1 |
| 댓글 목록 | `useGetComments` | `GET /posts/:postId/comments` | 불필요 |
| 댓글 작성 | `useCreateComment` | `POST /posts/:postId/comments` | 필수 |
| 댓글 삭제 | `useDeleteComment` | `DELETE /comments/:commentId` | 필수 (본인 것만) |

```mermaid
sequenceDiagram
    autonumber
    actor U as 사용자
    participant W as apps/web
    participant K as Kakao
    participant A as apps/api
    participant DB as Supabase Postgres

    rect rgb(245,245,245)
    note over U,DB: 로그인
    U->>W: 카카오로 로그인
    W->>K: Kakao.Auth.login()
    K-->>W: kakaoAccessToken
    W->>A: POST /auth/kakao/login
    A->>K: GET /v2/user/me (토큰 검증)
    K-->>A: 카카오 프로필
    A->>DB: users upsert (kakao_id)
    A-->>W: { accessToken(JWT), user }
    W->>W: useAuthStore.login() · localStorage 저장
    end

    rect rgb(245,245,245)
    note over U,DB: 목록 · 상세 (비로그인도 가능)
    U->>W: /posts 진입
    W->>A: GET /posts?page=1&limit=9
    A->>DB: findAndCount (published_at DESC)
    A-->>W: { data, total, page, limit }
    U->>W: 게시물 클릭
    W->>A: GET /posts/:id (+ Authorization, 있으면)
    A->>A: OptionalAuthGuard
    A->>DB: findOneBy(id)
    alt 로그인 상태
        A->>DB: view_count + 1
    end
    A-->>W: Post
    W->>A: GET /posts/:id/comments
    A->>DB: comments + 작성자 users 조회
    A-->>W: Comment[]
    end

    rect rgb(245,245,245)
    note over U,DB: 댓글 작성 · 삭제 (로그인 필수)
    U->>W: 댓글 등록
    W->>A: POST /posts/:id/comments
    A->>A: AuthGuard — JWT 검증 실패 시 401
    A->>DB: comments insert
    A-->>W: Comment
    W->>W: invalidateQueries(['comments', postId])
    W->>A: GET /posts/:id/comments (재조회)
    U->>W: 내 댓글 삭제
    W->>A: DELETE /comments/:commentId
    A->>DB: 소유자 확인 후 delete
    A-->>W: 204 · 목록 invalidate
    end
```

핵심: 모든 요청의 `Authorization` 헤더는 `restClient` 인터셉터가 `useAuthStore`에서 꺼내 자동으로 붙인다. 뮤테이션은 응답을 직접 캐시에 넣지 않고 `invalidateQueries`로 재조회한다.

## 일일 생성 (apps/api 미경유)

```mermaid
flowchart LR
    Trigger["Apps Script 시간 트리거<br/>generateDailyPost"] --> Gen["daily-story-generator.gs"]
    Gen -->|월별 장르 분기| Prompt["genres.story_prompt"]
    Gen -->|텍스트 생성, 모델 폴백 체인| GemT["Gemini API"]
    Gen -->|썸네일 생성, 모델 폴백 체인| GemI["Gemini API"]
    GemI --> Storage["Supabase Storage 업로드"]
    Storage --> Insert["posts insert<br/>service_role 레거시 JWT 키"]
    GemT --> Insert
    Insert --> DB[("Supabase Postgres")]
```

운영 크론은 Apps Script가 전부 처리한다 — apps/api가 떠 있을 필요 없음.
