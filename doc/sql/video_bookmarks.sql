create table if not exists public.video_bookmarks (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salon(id_salon) on delete cascade,
  video_id uuid not null references public.video(id_video) on delete cascade,
  video_title text not null,
  time_seconds integer not null default 0,
  label text not null,
  by_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists video_bookmarks_salon_created_idx
  on public.video_bookmarks (salon_id, created_at desc);

create index if not exists video_bookmarks_video_time_idx
  on public.video_bookmarks (video_id, time_seconds asc);

alter table public.video_bookmarks enable row level security;

drop policy if exists "video bookmarks read" on public.video_bookmarks;
create policy "video bookmarks read"
on public.video_bookmarks
for select
to anon, authenticated
using (true);

drop policy if exists "video bookmarks insert" on public.video_bookmarks;
create policy "video bookmarks insert"
on public.video_bookmarks
for insert
to anon, authenticated
with check (true);
