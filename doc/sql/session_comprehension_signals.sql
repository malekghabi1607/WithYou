create table if not exists public.session_comprehension_signals (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salon(id_salon) on delete cascade,
  user_id uuid not null,
  user_name text not null,
  status text not null check (status in ('understood', 'slow_down', 'lost')),
  video_id uuid null references public.video(id_video) on delete set null,
  video_time_seconds integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint session_comprehension_signals_unique_user unique (salon_id, user_id)
);

create index if not exists session_comprehension_signals_salon_updated_idx
  on public.session_comprehension_signals (salon_id, updated_at desc);

create index if not exists session_comprehension_signals_status_idx
  on public.session_comprehension_signals (salon_id, status);

alter table public.session_comprehension_signals enable row level security;

drop policy if exists "session comprehension read" on public.session_comprehension_signals;
create policy "session comprehension read"
on public.session_comprehension_signals
for select
to anon, authenticated
using (true);

drop policy if exists "session comprehension insert" on public.session_comprehension_signals;
create policy "session comprehension insert"
on public.session_comprehension_signals
for insert
to anon, authenticated
with check (true);

drop policy if exists "session comprehension update" on public.session_comprehension_signals;
create policy "session comprehension update"
on public.session_comprehension_signals
for update
to anon, authenticated
using (true)
with check (true);
