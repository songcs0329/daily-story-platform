-- Supabase Dashboard → SQL Editor에 붙여넣고 실행.
-- apps/api/src/posts/entities/posts.entity.ts 와 1:1로 맞춘 스키마 (컬럼 추가/변경 시 같이 갱신할 것).
--
-- RLS는 설정하지 않는다: apps/api가 Supabase의 PostgREST(anon/authenticated 롤)가 아니라
-- DATABASE_URL로 Postgres에 직접 접속하므로 RLS 정책의 적용 대상이 아니다.

create type post_genre as enum ('horror', 'romance');

create table posts (
  id integer generated always as identity primary key,
  title text not null,
  content text not null,
  thumbnail_url text not null,
  genre post_genre not null,
  view_count integer not null default 0,
  published_at timestamptz not null
);
