create table if not exists public.session_interludes (
  salon_id uuid primary key references public.salon(id_salon) on delete cascade,
  enabled boolean not null default false,
  message text not null default '',
  ends_at timestamptz null,
  updated_by text null,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists session_interludes_updated_idx
  on public.session_interludes (updated_at desc);

alter table public.session_interludes enable row level security;

drop policy if exists "session interludes read" on public.session_interludes;
create policy "session interludes read"
on public.session_interludes
for select
to anon, authenticated
using (true);

drop policy if exists "session interludes insert" on public.session_interludes;
create policy "session interludes insert"
on public.session_interludes
for insert
to anon, authenticated
with check (true);

drop policy if exists "session interludes update" on public.session_interludes;
create policy "session interludes update"
on public.session_interludes
for update
to anon, authenticated
using (true)
with check (true);
