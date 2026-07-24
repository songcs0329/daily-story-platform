# daily-story-platform / web

매일 생성되는 단편소설을 열람하는 프론트엔드. Vite + React 19 + TanStack Query + Zustand + TailwindCSS v4.

## 실행

```bash
pnpm --filter web dev      # 개발 서버 (http://localhost:5173)
pnpm --filter web build    # tsc -b && vite build
pnpm --filter web lint     # eslint
```

## 구조

| 경로 | 역할 |
|---|---|
| `src/pages/` | 라우트 단위 화면 |
| `src/components/` | 재사용 가능한 UI |
| `src/hooks/` | API 훅(`use` + apiManager 메소드명, 예: `useGetTodo`) / 로직 훅(`useXxxForm`) |
| `src/stores/` | Zustand — 여러 페이지에서 공유되는 상태에만 사용 |
| `src/libs/apis/restClient.ts` | Axios 인스턴스, `{ status, data }` 반환 |
| `src/libs/apis/apiManager.ts` | `restClient`를 호출하는 도메인 함수 |
| `src/libs/types/` | 이 앱 전용 타입 (`Post`/`Genre` 등 공용 타입은 `packages/shared`) |

데이터 흐름: `Page/Component → useXxx 훅 → apiManager.getXxx() → restClient.get<ApiResponse.Xxx>()`

경로 별칭 `@`는 `src/`로 해석된다.

장르는 공포/로맨스 하드코딩 분기이며, 장르 확장용 테이블/전략 패턴은 도입하지 않는다.

상세 컨벤션은 루트 [CLAUDE.md](../../CLAUDE.md) 참고.
