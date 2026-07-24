# daily-story-platform / api

단편소설 게시판의 백엔드(NestJS). 게시글 조회 API를 제공한다.

> **실제 운영 크론은 이 API가 아니다.** 매일 소설/썸네일 생성 → Supabase Storage 업로드 → `posts` insert까지 전 과정은 `scripts/apps-script/daily-story-generator.gs`(Google Apps Script)가 직접 처리하며, `apps/api`가 떠 있을 필요가 없다. `src/generation/`(`POST /generation`, 헤더 `x-generation-secret`)은 수동/로컬 테스트 전용으로 실제 스케줄에는 붙지 않는다.

## 실행

```bash
pnpm --filter api start:dev   # watch 모드 (http://localhost:3000)
pnpm --filter api build       # nest build
pnpm --filter api lint        # eslint --fix
```

## 스택

NestJS + TypeORM + Supabase(Postgres/Storage). DB 스키마는 `supabase/schema.sql`에서 관리하며 `src/posts/entities/*.entity.ts`와 1:1로 맞춘다.

## 컨벤션

리소스 모듈은 `src/posts/`처럼 폴더/모듈/컨트롤러/서비스/엔티티/라우트 모두 복수형으로 만든다. 새 리소스는 `nest g module/controller/service <name>`으로 확장한다.

## 배포

Render (`render.yaml`, 모노레포 루트에서 `pnpm install && pnpm --filter api build`). 인증 없는 공개 조회 API라 `app.enableCors()`로 모든 origin을 허용한다.

상세 컨벤션은 루트 [CLAUDE.md](../../CLAUDE.md) 참고.
