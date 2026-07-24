-- Supabase Dashboard → SQL Editor에 붙여넣고 실행.
-- apps/api/src/posts/entities/posts.entity.ts, apps/api/src/genres/entities/genres.entity.ts 와
-- 1:1로 맞춘 스키마 (컬럼 추가/변경 시 같이 갱신할 것).
--
-- RLS는 설정하지 않는다: apps/api가 Supabase의 PostgREST(anon/authenticated 롤)가 아니라
-- DATABASE_URL로 Postgres에 직접 접속하므로 RLS 정책의 적용 대상이 아니다.

create table genres (
  slug text primary key,
  label text not null,
  story_prompt text not null
);

insert into genres (slug, label, story_prompt) values
  ('horror', '공포', '한국어로 짧은 공포 단편소설을 써줘. 소름 끼치고 긴장감 있는 분위기로, 1200~2000자 분량. 제목도 함께 지어줘.'),
  ('romance', '로맨스', '한국어로 짧은 로맨스 단편소설을 써줘. 따뜻하고 설레는 분위기로, 1200~2000자 분량. 제목도 함께 지어줘.'),
  ('thriller', '스릴러', '한국어로 짧은 범죄/스릴러 단편소설을 써줘. 긴장감 있고 반전이 있는 전개로, 1200~2000자 분량. 제목도 함께 지어줘.'),
  ('fantasy', '판타지', '한국어로 짧은 판타지 단편소설을 써줘. 신비롭고 상상력 넘치는 세계관으로, 1200~2000자 분량. 제목도 함께 지어줘.'),
  ('sf', 'SF', '한국어로 짧은 SF 단편소설을 써줘. 미래적이고 사변적인 상상력이 돋보이는 분위기로, 1200~2000자 분량. 제목도 함께 지어줘.'),
  ('comedy', '코미디', '한국어로 짧은 코미디 단편소설을 써줘. 유쾌하고 위트있는 전개로, 1200~2000자 분량. 제목도 함께 지어줘.');

create table posts (
  id integer generated always as identity primary key,
  title text not null,
  content text not null,
  thumbnail_url text not null,
  genre text not null references genres(slug),
  view_count integer not null default 0,
  published_at timestamptz not null
);

-- 기존 DB에 이미 posts 테이블이 있는 경우(enum 기반 마이그레이션, 2026-07-24 적용 완료):
--   alter table posts alter column genre type text using genre::text;
--   alter table posts add constraint posts_genre_fkey foreign key (genre) references genres(slug);
--   drop type posts_genre_enum; -- TypeORM synchronize가 만든 실제 enum 타입명(스키마 파일의 post_genre와 다름)
-- (위 genres insert를 먼저 실행한 뒤 적용할 것)
